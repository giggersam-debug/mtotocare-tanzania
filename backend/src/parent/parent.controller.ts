import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ParentService } from './parent.service';
import { ParentLookupDto } from './dto/parent-lookup.dto';
import { RequestOtpDto } from './dto/request-otp.dto';

// Deliberately public — guardians authenticate with QR token + phone +
// SMS OTP, not a staff JWT. No JwtAuthGuard/RolesGuard on this controller.
@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post('request-otp')
  @HttpCode(200)
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.parentService.requestOtp(dto.qrToken, dto.phone);
  }

  @Post('lookup')
  @HttpCode(200)
  lookup(@Body() dto: ParentLookupDto) {
    return this.parentService.lookup(dto.qrToken, dto.phone, dto.otp);
  }
}
