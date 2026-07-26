import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaternalHealthRecord } from './entities/maternal-health-record.entity';
import { Child } from '../children/entities/child.entity';
import { User } from '../auth/entities/user.entity';
import { RecordMaternalHealthDto } from './dto/record-maternal-health.dto';
import { UpdateMaternalHealthDto } from './dto/update-maternal-health.dto';
import type { AuthenticatedUser } from '../auth/types';

@Injectable()
export class MaternalHealthService {
  constructor(
    @InjectRepository(MaternalHealthRecord) private readonly records: Repository<MaternalHealthRecord>,
    @InjectRepository(Child) private readonly children: Repository<Child>,
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
