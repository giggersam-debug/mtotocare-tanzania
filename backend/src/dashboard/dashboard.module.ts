import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Child } from '../children/entities/child.entity';
import { Facility } from '../children/entities/facility.entity';
import { Vaccination } from '../vaccinations/entities/vaccination.entity';
import { GrowthRecord } from '../growth/entities/growth-record.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Child, Facility, Vaccination, GrowthRecord, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
