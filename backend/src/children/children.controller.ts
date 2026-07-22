import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';

@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  @Roles('nurse', 'doctor')
  register(@Body() dto: CreateChildDto, @CurrentUser() user: AuthenticatedUser) {
    return this.childrenService.register(dto, user.userId);
  }

  @Get('lookup/:qrToken')
  @Roles('nurse', 'doctor', 'nutritionist', 'pharmacist')
  lookup(@Param('qrToken') qrToken: string) {
    return this.childrenService.lookupByQrToken(qrToken);
  }

  @Get('search')
  @Roles('nurse', 'doctor', 'nutritionist', 'pharmacist', 'ministry', 'administrator')
  search(@Query('q') q: string) {
    return this.childrenService.search(q ?? '');
  }

  @Get(':childId')
  @Roles('nurse', 'doctor', 'nutritionist', 'pharmacist', 'ministry', 'administrator')
  getOne(@Param('childId') childId: string) {
    return this.childrenService.getById(childId);
  }

  @Get(':childId/schedule')
  @Roles('nurse', 'doctor', 'nutritionist', 'pharmacist', 'ministry', 'administrator')
  schedule(@Param('childId') childId: string) {
    return this.childrenService.scheduleForChild(childId);
  }
}
