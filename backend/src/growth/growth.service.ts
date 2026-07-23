import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GrowthRecord, NutritionalStatus } from './entities/growth-record.entity';
import { Child } from '../children/entities/child.entity';
import { User } from '../auth/entities/user.entity';
import { RecordGrowthDto } from './dto/record-growth.dto';
import { UpdateGrowthDto } from './dto/update-growth.dto';
import type { AuthenticatedUser } from '../auth/types';

// WHO/UNICEF simplified MUAC screen for acute malnutrition (children 6-59 months).
function classifyMuac(muacCm?: number): NutritionalStatus | undefined {
  if (muacCm === undefined) return undefined;
  if (muacCm < 11.5) return 'severe_acute_malnutrition';
  if (muacCm < 12.5) return 'moderate_acute_malnutrition';
  return 'normal';
}

@Injectable()
export class GrowthService {
  constructor(
    @InjectRepository(GrowthRecord) private readonly growthRecords: Repository<GrowthRecord>,
    @InjectRepository(Child) private readonly children: Repository<Child>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async record(dto: RecordGrowthDto, user: AuthenticatedUser) {
    if (dto.weightKg === undefined && dto.heightCm === undefined && dto.muacCm === undefined) {
      throw new BadRequestException('Record at least one measurement (weight, height, or MUAC)');
    }

    const child = await this.children.findOne({ where: { childId: dto.childId } });
    if (!child) throw new NotFoundException('No child found for that ID');

    const record = this.growthRecords.create({
      child,
      visitDate: dto.visitDate ?? new Date().toISOString().slice(0, 10),
      weightKg: dto.weightKg,
      heightCm: dto.heightCm,
      muacCm: dto.muacCm,
      nutritionalStatus: classifyMuac(dto.muacCm),
      recordedBy: user.userId,
      facility: user.facilityId ? ({ facilityId: user.facilityId } as any) : undefined,
      notes: dto.notes,
    });

    return this.growthRecords.save(record);
  }

  async historyForChild(childId: string) {
    const records = await this.growthRecords.find({
      where: { child: { childId } },
      relations: ['facility'],
      order: { visitDate: 'ASC' },
    });
    return this.withRecorderNames(records);
  }

  async update(growthRecordId: string, dto: UpdateGrowthDto) {
    const record = await this.growthRecords.findOne({ where: { growthRecordId } });
    if (!record) throw new NotFoundException('No growth record found for that ID');

    if (dto.visitDate !== undefined) record.visitDate = dto.visitDate;
    if (dto.weightKg !== undefined) record.weightKg = dto.weightKg;
    if (dto.heightCm !== undefined) record.heightCm = dto.heightCm;
    if (dto.muacCm !== undefined) {
      record.muacCm = dto.muacCm;
      record.nutritionalStatus = classifyMuac(dto.muacCm);
    }
    if (dto.notes !== undefined) record.notes = dto.notes;

    return this.growthRecords.save(record);
  }

  /** Attaches the recording staff member's name/phone and facility name to each row for display. */
  private async withRecorderNames(records: GrowthRecord[]) {
    const userIds = [...new Set(records.map((r) => r.recordedBy))];
    const staff = userIds.length ? await this.users.find({ where: { userId: In(userIds) } }) : [];
    const nameById = new Map(staff.map((u) => [u.userId, u.fullName]));
    const phoneById = new Map(staff.map((u) => [u.userId, u.phone ?? null]));
    const employeeNumberById = new Map(staff.map((u) => [u.userId, u.employeeNumber ?? null]));

    return records.map((r) => ({
      ...r,
      recordedByName: nameById.get(r.recordedBy) ?? null,
      recordedByPhone: phoneById.get(r.recordedBy) ?? null,
      recordedByEmployeeNumber: employeeNumberById.get(r.recordedBy) ?? null,
      facilityName: r.facility?.name ?? null,
    }));
  }
}
