import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrowthController } from './growth.controller';
import { GrowthService } from './growth.service';
import { GrowthRecord } from './entities/growth-record.entity';
import { Child } from '../children/entities/child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GrowthRecord, Child])],
  controllers: [GrowthController],
  providers: [GrowthService],
  exports: [GrowthService],
})
export class GrowthModule {}
