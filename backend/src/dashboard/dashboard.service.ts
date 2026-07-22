import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Child } from '../children/entities/child.entity';
import { Facility } from '../children/entities/facility.entity';
import { Vaccination } from '../vaccinations/entities/vaccination.entity';
import { GrowthRecord } from '../growth/entities/growth-record.entity';
import { User } from '../auth/entities/user.entity';
import type { AuthenticatedUser } from '../auth/types';

const DAY_MS = 24 * 60 * 60 * 1000;

// Tanzania EPI schedule (subset), expressed as days-since-birth a dose is due.
// Adolescent doses (HPV) are intentionally excluded — this registry's overdue
// screen is scoped to the infant/under-2 schedule.
const EPI_SCHEDULE: { code: string; dueAtDays: number }[] = [
  { code: 'BCG', dueAtDays: 0 },
  { code: 'OPV0', dueAtDays: 0 },
  { code: 'PENTA1', dueAtDays: 42 },
  { code: 'OPV1', dueAtDays: 42 },
  { code: 'PCV1', dueAtDays: 42 },
  { code: 'ROTA1', dueAtDays: 42 },
  { code: 'PENTA2', dueAtDays: 70 },
  { code: 'OPV2', dueAtDays: 70 },
  { code: 'PCV2', dueAtDays: 70 },
  { code: 'ROTA2', dueAtDays: 70 },
  { code: 'PENTA3', dueAtDays: 98 },
  { code: 'OPV3', dueAtDays: 98 },
  { code: 'PCV3', dueAtDays: 98 },
  { code: 'IPV', dueAtDays: 98 },
  { code: 'VITAMIN_A', dueAtDays: 182 },
  { code: 'YELLOW_FEVER', dueAtDays: 270 },
  { code: 'MEASLES_RUBELLA1', dueAtDays: 270 },
  { code: 'MEASLES_RUBELLA2', dueAtDays: 540 },
];

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Child) private readonly children: Repository<Child>,
    @InjectRepository(Facility) private readonly facilities: Repository<Facility>,
    @InjectRepository(Vaccination) private readonly vaccinations: Repository<Vaccination>,
    @InjectRepository(GrowthRecord) private readonly growthRecords: Repository<GrowthRecord>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async summary(user: AuthenticatedUser) {
    if (!user.facilityId) {
      throw new ForbiddenException('Your account is not linked to a facility');
    }

    const facility = await this.facilities.findOne({ where: { facilityId: user.facilityId } });

    const staff = await this.users.find({ where: { facility: { facilityId: user.facilityId } } });
    const staffIds = staff.map((u) => u.userId);

    const children = staffIds.length ? await this.children.find({ where: { createdBy: In(staffIds) } }) : [];

    const vaccinations = await this.vaccinations.find({
      where: { facility: { facilityId: user.facilityId } },
      relations: ['child'],
    });

    const growthRecords = await this.growthRecords.find({
      where: { facility: { facilityId: user.facilityId } },
      relations: ['child'],
    });

    const vaccinationsByVaccineMap = new Map<string, number>();
    for (const v of vaccinations) {
      vaccinationsByVaccineMap.set(v.vaccineCode, (vaccinationsByVaccineMap.get(v.vaccineCode) ?? 0) + 1);
    }

    const latestGrowthByChild = new Map<string, GrowthRecord>();
    for (const g of growthRecords) {
      const childId = g.child.childId;
      const existing = latestGrowthByChild.get(childId);
      if (!existing || g.visitDate > existing.visitDate) latestGrowthByChild.set(childId, g);
    }
    const malnutritionRiskCount = [...latestGrowthByChild.values()].filter(
      (g) => g.nutritionalStatus && g.nutritionalStatus !== 'normal',
    ).length;

    return {
      facilityName: facility?.name ?? null,
      childrenRegistered: children.length,
      vaccinationsGiven: vaccinations.length,
      vaccinationsByVaccine: [...vaccinationsByVaccineMap.entries()].map(([vaccineCode, count]) => ({
        vaccineCode,
        count,
      })),
      malnutritionRiskCount,
      overdueVaccinations: this.computeOverdue(children, vaccinations),
    };
  }

  private computeOverdue(children: Child[], vaccinations: Vaccination[]) {
    const givenByChild = new Map<string, Set<string>>();
    for (const v of vaccinations) {
      const set = givenByChild.get(v.child.childId) ?? new Set<string>();
      set.add(v.vaccineCode);
      givenByChild.set(v.child.childId, set);
    }

    const todayMs = Date.now();
    const overdue: { childId: string; fullName: string; vaccineCode: string; dueSince: string }[] = [];

    for (const child of children) {
      const dobMs = new Date(child.dateOfBirth).getTime();
      const ageDays = Math.floor((todayMs - dobMs) / DAY_MS);
      const given = givenByChild.get(child.childId) ?? new Set<string>();

      for (const item of EPI_SCHEDULE) {
        if (ageDays >= item.dueAtDays && !given.has(item.code)) {
          const dueDate = new Date(dobMs + item.dueAtDays * DAY_MS);
          overdue.push({
            childId: child.childId,
            fullName: child.fullName,
            vaccineCode: item.code,
            dueSince: dueDate.toISOString().slice(0, 10),
          });
        }
      }
    }

    overdue.sort((a, b) => (a.dueSince < b.dueSince ? -1 : 1));
    return overdue.slice(0, 50);
  }
}
