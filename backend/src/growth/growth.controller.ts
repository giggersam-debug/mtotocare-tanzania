import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GrowthService } from './growth.service';
import { RecordGrowthDto } from './dto/record-growth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';

@Controller('growth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GrowthController {
  constructor(private readonly growthService: GrowthService) {}

  @Post()
  @Roles('nurse', 'doctor', 'nutritionist')
  record(@Body() dto: RecordGrowthDto, @CurrentUser() user: AuthenticatedUser) {
    return this.growthService.record(dto, user);
  }

  @Get('child/:childId')
  @Roles('nurse', 'doctor', 'nutritionist', 'pharmacist')
  history(@Param('childId') childId: string) {
    return this.growthService.historyForChild(childId);
  }
}
