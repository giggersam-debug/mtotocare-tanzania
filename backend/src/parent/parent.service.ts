import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ChildrenService } from '../children/children.service';
import { VaccinationsService } from '../vaccinations/vaccinations.service';
import { GrowthService } from '../growth/growth.service';
import { MessagingService } from '../messaging/messaging.service';
import { RedisService } from '../common/redis/redis.service';

const OTP_TTL_SECONDS = 5 * 60; // 5 minutes to enter the code
const OTP_RESEND_COOLDOWN_SECONDS = 60; // don't spam SMS if they hit "resend"

function otpKey(qrToken: string, phone: string) {
  return `parent-otp:${qrToken}:${phone.trim()}`;
}

function cooldownKey(qrToken: string, phone: string) {
  return `parent-otp-cooldown:${qrToken}:${phone.trim()}`;
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

@Injectable()
export class ParentService {
  constructor(
    private readonly childrenService: ChildrenService,
    private readonly vaccinationsService: VaccinationsService,
    private readonly growthService: GrowthService,
    private readonly messaging: MessagingService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Sends a one-time code to the phone if (and only if) it matches a parent
   * on file for this QR code. Always returns a generic response either way
   * — never reveals whether the phone number is actually on file, to avoid
   * letting someone probe which numbers are registered to a given child.
   */
  async requestOtp(qrToken: string, phone: string) {
    const onCooldown = await this.redis.getJson<boolean>(cooldownKey(qrToken, phone));
    if (onCooldown) {
      return { sent: true, message: 'A code was already sent recently — check your messages.' };
    }

    try {
      const child = await this.childrenService.findByQrTokenForPortal(qrToken);
      const trimmed = phone.trim();
      const matches = child.guardian?.phone.trim() === trimmed || child.secondGuardian?.phone.trim() === trimmed;

      if (matches) {
        const otp = generateOtp();
        await this.redis.setJson(otpKey(qrToken, phone), otp, OTP_TTL_SECONDS);
        await this.redis.setJson(cooldownKey(qrToken, phone), true, OTP_RESEND_COOLDOWN_SECONDS);
        await this.messaging.sendSms(
          trimmed,
          `Your MtotoCare Parent Portal code is ${otp}. It expires in 5 minutes.`,
        );
      }
    } catch {
      // Invalid QR token — fall through to the same generic response.
    }

    return { sent: true, message: 'If that number is on file for this health ID, a code has been sent.' };
  }

  async lookup(qrToken: string, phone: string, otp: string) {
    const storedOtp = await this.redis.getJson<string>(otpKey(qrToken, phone));
    if (!storedOtp || storedOtp !== otp.trim()) {
      throw new UnauthorizedException('That code is invalid or has expired. Please request a new one.');
    }
    // One-time use — burn it immediately so it can't be replayed.
    await this.redis.getClient().del(otpKey(qrToken, phone));

    const child = await this.childrenService.verifyGuardianAccess(qrToken, phone);

    const [vaccinations, growth, schedule] = await Promise.all([
      this.vaccinationsService.historyForChild(child.childId),
      this.growthService.historyForChild(child.childId),
      this.childrenService.scheduleForChild(child.childId),
    ]);

    // Staff phone numbers and employee numbers are for facility/admin eyes
    // only — strip them before this reaches the public, unauthenticated
    // Parent Portal.
    const publicVaccinations = vaccinations.map(
      ({ administeredByPhone, administeredByEmployeeNumber, ...rest }: any) => rest,
    );
    const publicGrowth = growth.map(({ recordedByPhone, recordedByEmployeeNumber, ...rest }: any) => rest);

    return {
      child: {
        childId: child.childId,
        fullName: child.fullName,
        dateOfBirth: child.dateOfBirth,
        sex: child.sex,
        whatsappOptIn: child.guardian?.whatsappOptIn ?? false,
      },
      vaccinations: publicVaccinations,
      growth: publicGrowth,
      schedule,
    };
  }
}
