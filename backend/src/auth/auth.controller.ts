import { Body, Controller, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.username, dto.password);
  }

  // View-only for nurses/doctors — lets them see who's on staff and who's
  // been logging in without granting the ability to create or deactivate
  // accounts, which stays administrator-only below.
  @Get('staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrator', 'nurse', 'doctor')
  listStaff(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.listStaff(user);
  }

  @Post('staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrator')
  createStaff(@Body() dto: CreateStaffDto, @CurrentUser() user: AuthenticatedUser) {
    return this.auth.createStaff(dto, user);
  }

  @Patch('staff/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrator')
  updateStaff(
    @Param('userId') userId: string,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.auth.setStaffActive(userId, dto, user);
  }
}
