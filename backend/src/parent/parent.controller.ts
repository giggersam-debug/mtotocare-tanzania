import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ParentService } from './parent.service';
import { ParentLookupDto } from './dto/parent-lookup.dto';

// Deliberately public — guardians authenticate with QR token + phone match,
// not a staff JWT. No JwtAuthGuard/RolesGuard on this controller.
@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post('lookup')
  @HttpCode(200)
  lookup(@Body() dto: ParentLookupDto) {
    return this.parentService.lookup(dto.qrToken, dto.phone);
  }
}
