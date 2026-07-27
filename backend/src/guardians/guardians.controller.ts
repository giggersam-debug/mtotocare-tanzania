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

  // National ID is the primary lookup key; phone stays as a fallback for
  // when she doesn't have her ID card on hand, or is a "guardian" relation
  // who isn't required to have a National ID on file.
  @Get('search')
  @Roles('nurse', 'doctor', 'nutritionist', 'administrator', 'ministry')
  search(@Query('nationalId') nationalId?: string, @Query('phone') phone?: string) {
    if (nationalId?.trim()) {
      return this.guardiansService.searchByNationalId(nationalId);
    }
    return this.guardiansService.searchByPhone(phone ?? '');
  }
}
