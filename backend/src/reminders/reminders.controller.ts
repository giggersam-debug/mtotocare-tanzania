import { Controller, Post, UseGuards } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reminders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  // Manual trigger so staff can test/send without waiting for the daily cron.
  @Post('run-now')
  @Roles('nurse', 'doctor')
  runNow() {
    return this.remindersService.checkAndSend();
  }
}
