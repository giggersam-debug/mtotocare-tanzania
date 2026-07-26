import { Module } from '@nestjs/common';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { ChildrenModule } from '../children/children.module';
import { VaccinationsModule } from '../vaccinations/vaccinations.module';
import { GrowthModule } from '../growth/growth.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [ChildrenModule, VaccinationsModule, GrowthModule, MessagingModule],
  controllers: [ParentController],
  providers: [ParentService],
})
export class ParentModule {}
