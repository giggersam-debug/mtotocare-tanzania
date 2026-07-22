import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vaccination } from './entities/vaccination.entity';
import { Child } from '../children/entities/child.entity';
import { RecordVaccinationDto } from './dto/record-vaccination.dto';
import type { AuthenticatedUser } from '../auth/types';

@Injectable()
export class VaccinationsService {
  constructor(
    @InjectRepository(Vaccination) private readonly vaccinations: Repository<Vaccination>,
    @InjectRepository(Child) private readonly children: Repository<Child>,
  ) {}

  async record(dto: RecordVaccinationDto, user: AuthenticatedUser) {
    const child = await this.children.findOne({ where: { childId: dto.childId } });
    if (!child) throw new NotFoundException('No child found for that ID');

    const vaccination = this.vaccinations.create({
      child,
      vaccineCode: dto.vaccineCode,
      doseNumber: dto.doseNumber,
      administeredAt: dto.administeredAt ?? new Date().toISOString().slice(0, 10),
      administeredBy: user.userId,
      facility: user.facilityId ? ({ facilityId: user.facilityId } as any) : undefined,
      batchNumber: dto.batchNumber,
      notes: dto.notes,
    });

    return this.vaccinations.save(vaccination);
  }

  async historyForChild(childId: string) {
    return this.vaccinations.find({
      where: { child: { childId } },
      order: { administeredAt: 'ASC' },
    });
  }
}
