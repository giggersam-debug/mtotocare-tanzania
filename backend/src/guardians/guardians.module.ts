import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardiansController } from './guardians.controller';
import { GuardiansService } from './guardians.service';
import { Guardian } from '../children/entities/guardian.entity';
import { MaternalHealthRecord } from '../maternal-health/entities/maternal-health-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Guardian, MaternalHealthRecord])],
  controllers: [GuardiansController],
  providers: [GuardiansService],
  exports: [GuardiansService],
})
export class GuardiansModule {}
