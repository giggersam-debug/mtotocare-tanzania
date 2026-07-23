import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { ReminderLog } from './entities/reminder-log.entity';
import { Child } from '../children/entities/child.entity';
import { Vaccination } from '../vaccinations/entities/vaccination.entity';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReminderLog, Child, Vaccination]), MessagingModule],
  controllers: [RemindersController],
  providers: [RemindersService],
})
export class RemindersModule {}
