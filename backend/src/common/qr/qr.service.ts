import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

@Injectable()
export class QrService {
  /** Opaque token embedded in the QR code — carries no PII, only resolvable via Redis/Postgres. */
  generateToken(): string {
    return randomBytes(24).toString('base64url');
  }

  async toDataUrl(token: string): Promise<string> {
    return QRCode.toDataURL(token, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
    });
  }
}
