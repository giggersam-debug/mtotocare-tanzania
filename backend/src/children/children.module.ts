import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { Child } from './entities/child.entity';
import { Guardian } from './entities/guardian.entity';
import { Facility } from './entities/facility.entity';
import { Vaccination } from '../vaccinations/entities/vaccination.entity';
import { QrModule } from '../common/qr/qr.module';

@Module({
  imports: [TypeOrmModule.forFeature([Child, Guardian, Facility, Vaccination]), QrModule],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
