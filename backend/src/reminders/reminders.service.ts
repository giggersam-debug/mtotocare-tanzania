import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Child } from '../children/entities/child.entity';
import { Vaccination } from '../vaccinations/entities/vaccination.entity';
import { ReminderLog } from './entities/reminder-log.entity';
import { MessagingService } from '../messaging/messaging.service';
import { computeSchedule } from '../common/epi-schedule';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectRepository(Child) private readonly children: Repository<Child>,
    @InjectRepository(Vaccination) private readonly vaccinations: Repository<Vaccination>,
    @InjectRepository(ReminderLog) private readonly reminderLog: Repository<ReminderLog>,
    private readonly messaging: MessagingService,
  ) {}

  // Runs once a day. Timezone set to Tanzania so "daily" lines up with local mornings.
  @Cron(CronExpression.EVERY_DAY_AT_8AM, { timeZone: 'Africa/Dar_es_Salaam' })
  async runDailyCheck() {
    this.logger.log('Running daily vaccination reminder check…');
    const result = await this.checkAndSend();
    this.logger.log(
      `Reminder check complete: ${result.sent} sent, ${result.skipped} skipped, ${result.failed} failed`,
    );
    return result;
  }

  /** Scans every child for due/overdue vaccines and sends any not-yet-sent reminders. */
  async checkAndSend() {
    const children = await this.children.find({ relations: ['guardian'] });
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const child of children) {
      if (!child.guardian?.phone) {
        skipped++;
        continue;
      }

      const given = await this.vaccinations.find({ where: { child: { childId: child.childId } } });
      const givenCodes = new Set(given.map((v) => v.vaccineCode));
      const schedule = computeSchedule(child.dateOfBirth, givenCodes);
      const dueOrOverdue = schedule.filter((s) => s.status === 'due' || s.status === 'overdue');

      for (const item of dueOrOverdue) {
        const message = `MtotoCare Tanzania: ${child.fullName} is ${item.status === 'overdue' ? 'OVERDUE' : 'due'} for ${item.label} (scheduled ${item.dueDate}). Please visit your nearest health facility.`;

        const smsAlreadySent = await this.reminderLog.findOne({
          where: { child: { childId: child.childId }, vaccineCode: item.code, channel: 'sms' },
        });
        if (!smsAlreadySent) {
          const ok = await this.messaging.sendSms(child.guardian.phone, message);
          await this.reminderLog.save(
            this.reminderLog.create({ child, vaccineCode: item.code, channel: 'sms', status: ok ? 'sent' : 'failed' }),
          );
          ok ? sent++ : failed++;
        }

        if (child.guardian.whatsappOptIn) {
          const whatsappAlreadySent = await this.reminderLog.findOne({
            where: { child: { childId: child.childId }, vaccineCode: item.code, channel: 'whatsapp' },
          });
          if (!whatsappAlreadySent) {
            const ok = await this.messaging.sendWhatsapp(child.guardian.phone, message);
            await this.reminderLog.save(
              this.reminderLog.create({
                child,
                vaccineCode: item.code,
                channel: 'whatsapp',
                status: ok ? 'sent' : 'failed',
              }),
            );
            ok ? sent++ : failed++;
          }
        }
      }
    }

    return { sent, skipped, failed };
  }
}
