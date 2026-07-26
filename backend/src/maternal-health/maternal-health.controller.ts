import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MaternalHealthService } from './maternal-health.service';
import { RecordMaternalHealthDto } from './dto/record-maternal-health.dto';
import { RecordMaternalHealthForGuardianDto } from './dto/record-maternal-health-for-guardian.dto';
import { AttachMaternalHealthDto } from './dto/attach-maternal-health.dto';
import { UpdateMaternalHealthDto } from './dto/update-maternal-health.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';

// Tighter than vaccinations/growth: pharmacists are excluded since HIV
// status and genetic/family history aren't relevant to their role, and this
// data is more sensitive than the general child record.
@Controller('maternal-health')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaternalHealthController {
  constructor(private readonly maternalHealthService: MaternalHealthService) {}

  @Post()
  @Roles('nurse', 'doctor')
  record(@Body() dto: RecordMaternalHealthDto, @CurrentUser() user: AuthenticatedUser) {
    return this.maternalHealthService.record(dto, user);
  }

  // Standalone Mother Registration page — recorded against the mother
  // before her child exists.
  @Post('guardian')
  @Roles('nurse', 'doctor')
  recordForGuardian(@Body() dto: RecordMaternalHealthForGuardianDto, @CurrentUser() user: AuthenticatedUser) {
    return this.maternalHealthService.recordForGuardian(dto, user);
  }

  // Links a pre-birth pregnancy record to the child once she's registered.
  @Post('attach')
  @Roles('nurse', 'doctor')
  attach(@Body() dto: AttachMaternalHealthDto) {
    return this.maternalHealthService.attachToChild(dto.guardianId, dto.childId);
  }

  @Get('child/:childId')
  @Roles('nurse', 'doctor', 'nutritionist', 'administrator', 'ministry')
  forChild(@Param('childId') childId: string) {
    return this.maternalHealthService.forChild(childId);
  }

  @Patch(':maternalHealthRecordId')
  @Roles('nurse', 'doctor')
  update(
    @Param('maternalHealthRecordId') maternalHealthRecordId: string,
    @Body() dto: UpdateMaternalHealthDto,
  ) {
    return this.maternalHealthService.update(maternalHealthRecordId, dto);
  }
}
