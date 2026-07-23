import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facility } from '../children/entities/facility.entity';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';

@Injectable()
export class FacilitiesService {
  constructor(@InjectRepository(Facility) private readonly facilities: Repository<Facility>) {}

  list() {
    return this.facilities.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateFacilityDto) {
    const existing = await this.facilities.findOne({ where: { mohCode: dto.mohCode } });
    if (existing) throw new ConflictException('A facility with that MOH code already exists');

    const facility = this.facilities.create(dto);
    return this.facilities.save(facility);
  }

  async update(facilityId: string, dto: UpdateFacilityDto) {
    const facility = await this.facilities.findOne({ where: { facilityId } });
    if (!facility) throw new NotFoundException('No facility found for that ID');

    if (dto.mohCode && dto.mohCode !== facility.mohCode) {
      const clash = await this.facilities.findOne({ where: { mohCode: dto.mohCode } });
      if (clash) throw new ConflictException('A facility with that MOH code already exists');
    }

    if (dto.name !== undefined) facility.name = dto.name;
    if (dto.level !== undefined) facility.level = dto.level;
    if (dto.region !== undefined) facility.region = dto.region;
    if (dto.mohCode !== undefined) facility.mohCode = dto.mohCode;

    return this.facilities.save(facility);
  }
}
