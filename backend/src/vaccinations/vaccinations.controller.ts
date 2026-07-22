import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { VaccinationsService } from './vaccinations.service';
import { RecordVaccinationDto } from './dto/record-vaccination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';

@Controller('vaccinations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VaccinationsController {
  constructor(private readonly vaccinationsService: VaccinationsService) {}

  @Post()
  @Roles('nurse', 'doctor')
  record(@Body() dto: RecordVaccinationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.vaccinationsService.record(dto, user);
  }

  @Get('child/:childId')
  @Roles('nurse', 'doctor', 'nutritionist', 'pharmacist')
  history(@Param('childId') childId: string) {
    return this.vaccinationsService.historyForChild(childId);
  }
}
