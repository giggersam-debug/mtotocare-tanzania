import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Child } from './entities/child.entity';
import { Guardian } from './entities/guardian.entity';
import { Vaccination } from '../vaccinations/entities/vaccination.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { RedisService } from '../common/redis/redis.service';
import { QrService } from '../common/qr/qr.service';
import { computeSchedule } from '../common/epi-schedule';

// Hot cache TTL for the scan-lookup path. Postgres stays the source of
// truth; this just saves a round trip on every facility visit.
const CHILD_SUMMARY_TTL_SECONDS = 60 * 60 * 24;

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(Child) private readonly children: Repository<Child>,
    @InjectRepository(Guardian) private readonly guardians: Repository<Guardian>,
    @InjectRepository(Vaccination) private readonly vaccinations: Repository<Vaccination>,
    private readonly dataSource: DataSource,
    private readonly redis: RedisService,
    private readonly qr: QrService,
  ) {}

  async register(dto: CreateChildDto, registeredByUserId: string) {
    return this.dataSource.transaction(async (manager) => {
      const guardianRepo = manager.getRepository(Guardian);
      const childRepo = manager.getRepository(Child);

      // Reuse an existing guardian record by phone rather than duplicating
      // it for every sibling that gets registered.
      let guardian = await guardianRepo.findOne({ where: { phone: dto.guardian.phone } });
      if (!guardian) {
        guardian = guardianRepo.create({
          fullName: dto.guardian.fullName,
          relation: dto.guardian.relation,
          phone: dto.guardian.phone,
          whatsappOptIn: dto.guardian.whatsappOptIn ?? false,
          nationalIdRef: dto.guardian.nationalIdRef,
        });
        guardian = await guardianRepo.save(guardian);
      }

      let secondGuardian: Guardian | undefined;
      if (dto.secondGuardian) {
        secondGuardian = (await guardianRepo.findOne({ where: { phone: dto.secondGuardian.phone } })) ?? undefined;
        if (!secondGuardian) {
          secondGuardian = guardianRepo.create({
            fullName: dto.secondGuardian.fullName,
            relation: dto.secondGuardian.relation,
            phone: dto.secondGuardian.phone,
            whatsappOptIn: dto.secondGuardian.whatsappOptIn ?? false,
            nationalIdRef: dto.secondGuardian.nationalIdRef,
          });
          secondGuardian = await guardianRepo.save(secondGuardian);
        }
      }

      const qrToken = this.qr.generateToken();

      const child = childRepo.create({
        fullName: dto.fullName,
        dateOfBirth: dto.dateOfBirth,
        sex: dto.sex,
        birthWeightKg: dto.birthWeightKg,
        birthHeightCm: dto.birthHeightCm,
        region: dto.region,
        district: dto.district,
        ward: dto.ward,
        village: dto.village,
        birthRegistrationNumber: dto.birthRegistrationNumber,
        birthFacility: dto.birthFacilityId ? ({ facilityId: dto.birthFacilityId } as any) : undefined,
        guardian,
        secondGuardian,
        qrToken,
        createdBy: registeredByUserId,
      });

      const saved = await childRepo.save(child);

      // Populate the fast-lookup path used by the "scan QR at any facility" flow.
      await this.redis.setJson(`qr:${qrToken}`, { childId: saved.childId }, CHILD_SUMMARY_TTL_SECONDS);
      await this.redis.setJson(
        `child:${saved.childId}:summary`,
        {
          childId: saved.childId,
          fullName: saved.fullName,
          dateOfBirth: saved.dateOfBirth,
          sex: saved.sex,
          guardianPhone: guardian.phone,
        },
        CHILD_SUMMARY_TTL_SECONDS,
      );

      const qrCodeImage = await this.qr.toDataUrl(qrToken);

      return { child: saved, guardian, qrCodeImage };
    });
  }

  /** Resolves a scanned QR token to a child summary — Redis first, Postgres fallback. */
  async lookupByQrToken(qrToken: string) {
    const cached = await this.redis.getJson<{ childId: string }>(`qr:${qrToken}`);
    let childId = cached?.childId;

    if (!childId) {
      const child = await this.children.findOne({ where: { qrToken } });
      if (!child) throw new NotFoundException('No child found for that QR code');
      childId = child.childId;
    }

    const cachedSummary = await this.redis.getJson(`child:${childId}:summary`);
    if (cachedSummary) return cachedSummary;

    const child = await this.children.findOne({ where: { childId }, relations: ['guardian'] });
    if (!child) throw new NotFoundException('No child found for that QR code');

    return {
      childId: child.childId,
      fullName: child.fullName,
      dateOfBirth: child.dateOfBirth,
      sex: child.sex,
      guardianPhone: child.guardian?.phone,
    };
  }

  /** Staff-facing search by child name or (partial) health ID. */
  async search(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const like = `%${trimmed}%`;
    const children = await this.children
      .createQueryBuilder('child')
      .leftJoinAndSelect('child.guardian', 'guardian')
      .where('child.full_name ILIKE :like', { like })
      .orWhere('CAST(child.child_id AS TEXT) ILIKE :like', { like })
      .orderBy('child.full_name', 'ASC')
      .limit(20)
      .getMany();

    return children.map((child) => ({
      childId: child.childId,
      fullName: child.fullName,
      dateOfBirth: child.dateOfBirth,
      sex: child.sex,
      region: child.region,
      guardianPhone: child.guardian?.phone,
    }));
  }

  /** Full bio for the Child Profile page. */
  async getById(childId: string) {
    const child = await this.children.findOne({
      where: { childId },
      relations: ['guardian', 'secondGuardian', 'birthFacility'],
    });
    if (!child) throw new NotFoundException('No child found for that ID');

    return {
      childId: child.childId,
      fullName: child.fullName,
      dateOfBirth: child.dateOfBirth,
      sex: child.sex,
      birthWeightKg: child.birthWeightKg,
      birthHeightCm: child.birthHeightCm,
      region: child.region,
      district: child.district,
      ward: child.ward,
      village: child.village,
      birthFacility: child.birthFacility
        ? { facilityId: child.birthFacility.facilityId, name: child.birthFacility.name, region: child.birthFacility.region }
        : undefined,
      guardian: child.guardian
        ? {
            fullName: child.guardian.fullName,
            relation: child.guardian.relation,
            phone: child.guardian.phone,
          }
        : undefined,
      secondGuardian: child.secondGuardian
        ? {
            fullName: child.secondGuardian.fullName,
            relation: child.secondGuardian.relation,
            phone: child.secondGuardian.phone,
          }
        : undefined,
    };
  }

  /** Finds the child for a QR token and checks whether the given phone belongs to either parent on file. */
  async findByQrTokenForPortal(qrToken: string) {
    const child = await this.children.findOne({ where: { qrToken }, relations: ['guardian', 'secondGuardian'] });
    if (!child) throw new UnauthorizedException('We could not verify that phone number for this health ID.');
    return child;
  }

  /** Public Parent Portal access: QR token + a phone matching either parent on file. */
  async verifyGuardianAccess(qrToken: string, phone: string) {
    const child = await this.findByQrTokenForPortal(qrToken);
    const trimmed = phone.trim();
    const matches = child.guardian?.phone.trim() === trimmed || child.secondGuardian?.phone.trim() === trimmed;
    if (!matches) {
      throw new UnauthorizedException('We could not verify that phone number for this health ID.');
    }
    return child;
  }

  /** EPI schedule status (completed/due/overdue/not_yet_due) for the Child Profile tracker. */
  async scheduleForChild(childId: string) {
    const child = await this.children.findOne({ where: { childId } });
    if (!child) throw new NotFoundException('No child found for that ID');

    const given = await this.vaccinations.find({ where: { child: { childId } } });
    const givenCodes = new Set(given.map((v) => v.vaccineCode));

    return computeSchedule(child.dateOfBirth, givenCodes);
  }
}
