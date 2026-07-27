import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { MaternalHealthRecord } from './entities/maternal-health-record.entity';
import { AntenatalVisit } from './entities/antenatal-visit.entity';
import { Child } from '../children/entities/child.entity';
import { Guardian } from '../children/entities/guardian.entity';
import { User } from '../auth/entities/user.entity';
import { RecordMaternalHealthDto } from './dto/record-maternal-health.dto';
import { RecordMaternalHealthForGuardianDto } from './dto/record-maternal-health-for-guardian.dto';
import { UpdateMaternalHealthDto } from './dto/update-maternal-health.dto';
import { RecordAntenatalVisitDto } from './dto/record-antenatal-visit.dto';
import type { AuthenticatedUser } from '../auth/types';

@Injectable()
export class MaternalHealthService {
  constructor(
    @InjectRepository(MaternalHealthRecord) private readonly records: Repository<MaternalHealthRecord>,
    @InjectRepository(AntenatalVisit) private readonly visits: Repository<AntenatalVisit>,
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
      clinicalNotes: dto.clinicalNotes,
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
      clinicalNotes: dto.clinicalNotes,
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

    return this.enrichRecord(record);
  }

  /**
   * Returns a guardian's most recent maternal health record (pre-birth or
   * attached to a child), including her ANC visit history — used to surface
   * "previous clinic" context when she's found again during a new child's
   * registration, before the baby is born.
   */
  async forGuardian(guardianId: string) {
    const record = await this.records.findOne({
      where: { guardian: { guardianId } },
      relations: ['facility'],
      order: { createdAt: 'DESC' },
    });
    if (!record || !record.consentGiven) return null;

    return this.enrichRecord(record);
  }

  private async enrichRecord(record: MaternalHealthRecord) {
    const recorder = record.recordedBy
      ? await this.users.findOne({ where: { userId: record.recordedBy } })
      : null;

    const visits = await this.visitsForRecord(record.maternalHealthRecordId);
    // Visits are ordered most-recent-first, so the first one carrying a
    // next-visit-date is the current "next visit due".
    const nextVisitDue = visits.find((v) => v.nextVisitDate)?.nextVisitDate ?? null;

    return {
      ...record,
      recordedByName: recorder?.fullName ?? null,
      facilityName: record.facility?.name ?? null,
      visits,
      nextVisitDue,
    };
  }

  /**
   * Logs a single antenatal (ANC) visit against a pregnancy record — the
   * full visit history, distinct from the summary `anc_visits` count field.
   */
  async recordVisit(maternalHealthRecordId: string, dto: RecordAntenatalVisitDto, user: AuthenticatedUser) {
    const record = await this.records.findOne({ where: { maternalHealthRecordId } });
    if (!record) throw new NotFoundException('No maternal health record found for that ID');

    const visit = this.visits.create({
      maternalHealthRecord: record,
      visitDate: dto.visitDate,
      nextVisitDate: dto.nextVisitDate,
      notes: dto.notes,
      recordedBy: user.userId,
      facility: dto.facilityId
        ? ({ facilityId: dto.facilityId } as any)
        : user.facilityId
          ? ({ facilityId: user.facilityId } as any)
          : undefined,
    });

    return this.visits.save(visit);
  }

  /** Full ANC visit history for a pregnancy record, most recent first. */
  async visitsForRecord(maternalHealthRecordId: string) {
    const visits = await this.visits.find({
      where: { maternalHealthRecord: { maternalHealthRecordId } },
      relations: ['facility'],
      order: { visitDate: 'DESC' },
    });

    const recorderIds = Array.from(new Set(visits.map((v) => v.recordedBy).filter((id): id is string => !!id)));
    const recorders = recorderIds.length ? await this.users.find({ where: { userId: In(recorderIds) } }) : [];
    const recorderMap = new Map(recorders.map((r) => [r.userId, r.fullName]));

    return visits.map((v) => ({
      ...v,
      recordedByName: v.recordedBy ? (recorderMap.get(v.recordedBy) ?? null) : null,
      facilityName: v.facility?.name ?? null,
    }));
  }

  async update(maternalHealthRecordId: string, dto: UpdateMaternalHealthDto) {
    const record = await this.records.findOne({ where: { maternalHealthRecordId } });
    if (!record) throw new NotFoundException('No maternal health record found for that ID');

    Object.assign(record, dto);
    return this.records.save(record);
  }
}
