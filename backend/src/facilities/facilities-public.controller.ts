import { Controller, Get } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';

// Deliberately public — the marketing home page lists partner facilities
// without requiring a staff login. No JwtAuthGuard/RolesGuard here, and the
// service method only returns name/level/region (no MOH code).
@Controller('facilities-public')
export class FacilitiesPublicController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  list() {
    return this.facilitiesService.listPublic();
  }
}
