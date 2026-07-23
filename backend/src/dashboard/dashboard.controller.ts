import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles('nurse', 'doctor', 'nutritionist', 'pharmacist', 'ministry', 'administrator')
  summary(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.summary(user);
  }

  @Get('patients')
  @Roles('nurse', 'doctor', 'nutritionist', 'pharmacist', 'ministry', 'administrator')
  patients(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.patientList(user);
  }

  @Get('report')
  @Roles('nurse', 'doctor', 'nutritionist', 'pharmacist', 'ministry', 'administrator')
  report(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.report(user);
  }

  @Get('calendar')
  @Roles('nurse', 'doctor', 'nutritionist', 'pharmacist', 'ministry', 'administrator')
  calendar(@CurrentUser() user: AuthenticatedUser, @Query('month') month?: string) {
    return this.dashboardService.calendar(user, month);
  }
}
