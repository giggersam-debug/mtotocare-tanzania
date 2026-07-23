import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('facilities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  // No @Roles here — any authenticated staff member can view the facility
  // list (e.g. the health worker dashboard), not just administrators.
  // Creating/editing facilities remains administrator/ministry only below.
  @Get()
  list() {
    return this.facilitiesService.list();
  }

  @Post()
  @Roles('administrator', 'ministry')
  create(@Body() dto: CreateFacilityDto) {
    return this.facilitiesService.create(dto);
  }

  @Patch(':facilityId')
  @Roles('administrator', 'ministry')
  update(@Param('facilityId') facilityId: string, @Body() dto: UpdateFacilityDto) {
    return this.facilitiesService.update(facilityId, dto);
  }
}
