import { Injectable } from '@nestjs/common';
import { ChildrenService } from '../children/children.service';
import { VaccinationsService } from '../vaccinations/vaccinations.service';
import { GrowthService } from '../growth/growth.service';

@Injectable()
export class ParentService {
  constructor(
    private readonly childrenService: ChildrenService,
    private readonly vaccinationsService: VaccinationsService,
    private readonly growthService: GrowthService,
  ) {}

  async lookup(qrToken: string, phone: string) {
    const child = await this.childrenService.verifyGuardianAccess(qrToken, phone);

    const [vaccinations, growth, schedule] = await Promise.all([
      this.vaccinationsService.historyForChild(child.childId),
      this.growthService.historyForChild(child.childId),
      this.childrenService.scheduleForChild(child.childId),
    ]);

    // Staff phone numbers and employee numbers are for facility/admin eyes
    // only — strip them before this reaches the public, unauthenticated
    // Parent Portal.
    const publicVaccinations = vaccinations.map(
      ({ administeredByPhone, administeredByEmployeeNumber, ...rest }: any) => rest,
    );
    const publicGrowth = growth.map(({ recordedByPhone, recordedByEmployeeNumber, ...rest }: any) => rest);

    return {
      child: {
        childId: child.childId,
        fullName: child.fullName,
        dateOfBirth: child.dateOfBirth,
        sex: child.sex,
        whatsappOptIn: child.guardian?.whatsappOptIn ?? false,
      },
      vaccinations: publicVaccinations,
      growth: publicGrowth,
      schedule,
    };
  }
}
