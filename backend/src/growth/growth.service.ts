import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrowthRecord, NutritionalStatus } from './entities/growth-record.entity';
import { Child } from '../children/entities/child.entity';
import { RecordGrowthDto } from './dto/record-growth.dto';
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
    return this.growthRecords.find({
      where: { child: { childId } },
      order: { visitDate: 'ASC' },
    });
  }
}
