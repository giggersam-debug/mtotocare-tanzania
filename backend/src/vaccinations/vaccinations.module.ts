import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaccinationsController } from './vaccinations.controller';
import { VaccinationsService } from './vaccinations.service';
import { Vaccination } from './entities/vaccination.entity';
import { Child } from '../children/entities/child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vaccination, Child])],
  controllers: [VaccinationsController],
  providers: [VaccinationsService],
  exports: [VaccinationsService],
})
export class VaccinationsModule {}
