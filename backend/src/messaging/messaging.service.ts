import { Injectable, Logger } from '@nestjs/common';

// Sends SMS and WhatsApp messages via Twilio's REST API using plain fetch
// (no SDK dependency needed). Credentials come from environment variables
// that the account owner must create and set on the backend service —
// this service never creates the Twilio account or handles billing.
@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);
  private readonly accountSid = process.env.TWILIO_ACCOUNT_SID;
  private readonly authToken = process.env.TWILIO_AUTH_TOKEN;
  private readonly smsFrom = process.env.TWILIO_SMS_FROM; // e.g. +15551234567
  private readonly whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886

  get isConfigured(): boolean {
    return Boolean(this.accountSid && this.authToken);
  }

  async sendSms(toPhone: string, body: string): Promise<boolean> {
    if (!this.isConfigured || !this.smsFrom) {
      this.logger.warn('Twilio SMS not configured (missing env vars) — skipping send');
      return false;
    }
    return this.postMessage(toPhone, this.smsFrom, body);
  }

  async sendWhatsapp(toPhone: string, body: string): Promise<boolean> {
    if (!this.isConfigured || !this.whatsappFrom) {
      this.logger.warn('Twilio WhatsApp not configured (missing env vars) — skipping send');
      return false;
    }
    return this.postMessage(`whatsapp:${toPhone}`, this.whatsappFrom, body);
  }

  private async postMessage(to: string, from: string, body: string): Promise<boolean> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const params = new URLSearchParams({ To: to, From: from, Body: body });
    const basicAuth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Twilio send to ${to} failed (${res.status}): ${text}`);
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error(`Twilio send to ${to} threw: ${err instanceof Error ? err.message : err}`);
      return false;
    }
  }
}
