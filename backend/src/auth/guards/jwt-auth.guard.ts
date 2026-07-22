import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Populated by the Auth & Identity module — validates the facility-scoped
// JWT issued at /auth/login and attaches `request.user`. Stubbed here so
// the Children module can be reviewed standalone.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
