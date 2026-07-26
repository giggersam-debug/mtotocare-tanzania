import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { GuardiansService } from './guardians.service';
import { RegisterGuardianDto } from './dto/register-guardian.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('guardians')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post()
  @Roles('nurse', 'doctor')
  register(@Body() dto: RegisterGuardianDto) {
    return this.guardiansService.register(dto);
  }

  @Get('search')
  @Roles('nurse', 'doctor', 'nutritionist', 'administrator', 'ministry')
  search(@Query('phone') phone: string) {
    return this.guardiansService.searchByPhone(phone ?? '');
  }
}
