import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedUser } from '../types';

interface JwtPayload {
  sub: string;
  role: AuthenticatedUser['role'];
  facilityId?: string;
}

// Validates the Bearer token that ChildrenController's JwtAuthGuard expects.
// The shape returned by validate() becomes `request.user`, consumed by the
// @CurrentUser() decorator — it must match AuthenticatedUser exactly.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Signature + expiry are already verified by passport-jwt at this point.
    return { userId: payload.sub, role: payload.role, facilityId: payload.facilityId };
  }
}
