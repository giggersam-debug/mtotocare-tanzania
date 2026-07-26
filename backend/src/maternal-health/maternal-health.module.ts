import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaternalHealthController } from './maternal-health.controller';
import { MaternalHealthService } from './maternal-health.service';
import { MaternalHealthRecord } from './entities/maternal-health-record.entity';
import { Child } from '../children/entities/child.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaternalHealthRecord, Child, User])],
  controllers: [MaternalHealthController],
  providers: [MaternalHealthService],
  exports: [MaternalHealthService],
})
export class MaternalHealthModule {}
