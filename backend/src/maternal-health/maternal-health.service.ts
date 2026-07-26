import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { MaternalHealthRecord } from './entities/maternal-health-record.entity';
import { Child } from '../children/entities/child.entity';
import { Guardian } from '../children/entities/guardian.entity';
import { User } from '../auth/entities/user.entity';
import { RecordMaternalHealthDto } from './dto/record-maternal-health.dto';
import { RecordMaternalHealthForGuardianDto } from './dto/record-maternal-health-for-guardian.dto';
import { UpdateMaternalHealthDto } from './dto/update-maternal-health.dto';
import type { AuthenticatedUser } from '../auth/types';

@Injectable()
export class MaternalHealthService {
  constructor(
    @InjectRepository(MaternalHealthRecord) private readonly records: Repository<MaternalHealthRecord>,
    @InjectRepository(Child) private readonly children: Repository<Child>,
    @InjectRepository(Guardian) private readonly guardians: Repository<Guardian>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async record(dto: RecordMaternalHealthDto, user: AuthenticatedUser) {
    // Hard consent gate — this data does not get stored without it, no
    // matter what the form sends.
    if (!dto.consentGiven) {
      throw new ForbiddenException("The mother's consent is required to record this information");
    }

    const child = await this.children.findOne({ where: { childId: dto.childId }, relations: ['guardian'] });
    if (!child) throw new NotFoundException('No child found for that ID');

    const existing = await this.records.findOne({ where: { child: { childId: dto.childId } } });
    if (existing) throw new BadRequestException('A maternal health record already exists for this child');

    const record = this.records.create({
      child,
      guardian: child.guardian,
      gravida: dto.gravida,
      para: dto.para,
      estimatedDueDate: dto.estimatedDueDate,
      ancVisits: dto.ancVisits,
      gestationalAgeWeeks: dto.gestationalAgeWeeks,
      gestationalDiabetes: dto.gestationalDiabetes ?? false,
      hypertension: dto.hypertension ?? false,
      anemia: dto.anemia ?? false,
      malariaInPregnancy: dto.malariaInPregnancy ?? false,
      hivStatus: dto.hivStatus ?? 'unknown',
      artAdherence: dto.artAdherence,
      deliveryMode: dto.deliveryMode,
      apgarScore: dto.apgarScore,
      deliveryComplications: dto.deliveryComplications,
      geneticFamilyHistory: dto.geneticFamilyHistory,
      consentGiven: dto.consentGiven,
      recordedBy: user.userId,
      facility: user.facilityId ? ({ facilityId: user.facilityId } as any) : undefined,
    });

    return this.records.save(record);
  }

  /**
   * Records pregnancy history against the mother directly, before her child
   * exists in the system — used by the standalone Mother Registration page
   * during an antenatal visit. `attachToChild` links it up once the baby is
   * born and registered.
   */
  async recordForGuardian(dto: RecordMaternalHealthForGuardianDto, user: AuthenticatedUser) {
    if (!dto.consentGiven) {
      throw new ForbiddenException("The mother's consent is required to record this information");
    }

    const guardian = await this.guardians.findOne({ where: { guardianId: dto.guardianId } });
    if (!guardian) throw new NotFoundException('No guardian found for that ID');

    const record = this.records.create({
      guardian,
      gravida: dto.gravida,
      para: dto.para,
      estimatedDueDate: dto.estimatedDueDate,
      ancVisits: dto.ancVisits,
      gestationalAgeWeeks: dto.gestationalAgeWeeks,
      gestationalDiabetes: dto.gestationalDiabetes ?? false,
      hypertension: dto.hypertension ?? false,
      anemia: dto.anemia ?? false,
      malariaInPregnancy: dto.malariaInPregnancy ?? false,
      hivStatus: dto.hivStatus ?? 'unknown',
      artAdherence: dto.artAdherence,
      geneticFamilyHistory: dto.geneticFamilyHistory,
      consentGiven: dto.consentGiven,
      recordedBy: user.userId,
      facility: user.facilityId ? ({ facilityId: user.facilityId } as any) : undefined,
    });

    return this.records.save(record);
  }

  /**
   * Links the mother's most recent pre-birth pregnancy record (if any) to
   * her newborn once the child is registered. No-op if she never had one on
   * file — most children won't.
   */
  async attachToChild(guardianId: string, childId: string) {
    const pending = await this.records.findOne({
      where: { guardian: { guardianId }, child: IsNull() },
      order: { createdAt: 'DESC' },
    });
    if (!pending) return null;

    pending.child = { childId } as any;
    return this.records.save(pending);
  }

  /** Returns the maternal health record for a child, or null if none/no consent. */
  async forChild(childId: string) {
    const record = await this.records.findOne({
      where: { child: { childId } },
      relations: ['facility'],
    });
    if (!record || !record.consentGiven) return null;

    const recorder = record.recordedBy
      ? await this.users.findOne({ where: { userId: record.recordedBy } })
      : null;

    return {
      ...record,
      recordedByName: recorder?.fullName ?? null,
      facilityName: record.facility?.name ?? null,
    };
  }

  async update(maternalHealthRecordId: string, dto: UpdateMaternalHealthDto) {
    const record = await this.records.findOne({ where: { maternalHealthRecordId } });
    if (!record) throw new NotFoundException('No maternal health record found for that ID');

    Object.assign(record, dto);
    return this.records.save(record);
  }
}
