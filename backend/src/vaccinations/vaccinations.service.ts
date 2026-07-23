import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Vaccination } from './entities/vaccination.entity';
import { Child } from '../children/entities/child.entity';
import { User } from '../auth/entities/user.entity';
import { RecordVaccinationDto } from './dto/record-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';
import type { AuthenticatedUser } from '../auth/types';

@Injectable()
export class VaccinationsService {
  constructor(
    @InjectRepository(Vaccination) private readonly vaccinations: Repository<Vaccination>,
    @InjectRepository(Child) private readonly children: Repository<Child>,
    @InjectRepository(User) private readonly users: Repository<User>,
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
    const records = await this.vaccinations.find({
      where: { child: { childId } },
      relations: ['facility'],
      order: { administeredAt: 'ASC' },
    });
    return this.withRecorderNames(records);
  }

  async update(vaccinationId: string, dto: UpdateVaccinationDto) {
    const record = await this.vaccinations.findOne({ where: { vaccinationId } });
    if (!record) throw new NotFoundException('No vaccination record found for that ID');

    if (dto.vaccineCode !== undefined) record.vaccineCode = dto.vaccineCode;
    if (dto.doseNumber !== undefined) record.doseNumber = dto.doseNumber;
    if (dto.administeredAt !== undefined) record.administeredAt = dto.administeredAt;
    if (dto.batchNumber !== undefined) record.batchNumber = dto.batchNumber;
    if (dto.notes !== undefined) record.notes = dto.notes;

    return this.vaccinations.save(record);
  }

  /** Attaches the recording staff member's name/phone and facility name to each row for display. */
  private async withRecorderNames(records: Vaccination[]) {
    const userIds = [...new Set(records.map((r) => r.administeredBy))];
    const staff = userIds.length ? await this.users.find({ where: { userId: In(userIds) } }) : [];
    const nameById = new Map(staff.map((u) => [u.userId, u.fullName]));
    const phoneById = new Map(staff.map((u) => [u.userId, u.phone ?? null]));
    const employeeNumberById = new Map(staff.map((u) => [u.userId, u.employeeNumber ?? null]));

    return records.map((r) => ({
      ...r,
      administeredByName: nameById.get(r.administeredBy) ?? null,
      administeredByPhone: phoneById.get(r.administeredBy) ?? null,
      administeredByEmployeeNumber: employeeNumberById.get(r.administeredBy) ?? null,
      facilityName: r.facility?.name ?? null,
    }));
  }
}
