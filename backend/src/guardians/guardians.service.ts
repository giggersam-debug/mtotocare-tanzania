import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Guardian } from '../children/entities/guardian.entity';
import { MaternalHealthRecord } from '../maternal-health/entities/maternal-health-record.entity';
import { RegisterGuardianDto } from './dto/register-guardian.dto';

@Injectable()
export class GuardiansService {
  constructor(
    @InjectRepository(Guardian) private readonly guardians: Repository<Guardian>,
    @InjectRepository(MaternalHealthRecord)
    private readonly maternalHealthRecords: Repository<MaternalHealthRecord>,
  ) {}

  /** Registers a mother/guardian on her own, ahead of any child existing. Dedupes by phone. */
  async register(dto: RegisterGuardianDto) {
    let guardian = await this.guardians.findOne({ where: { phone: dto.phone } });
    if (!guardian) {
      guardian = this.guardians.create({
        fullName: dto.fullName,
        relation: dto.relation,
        phone: dto.phone,
        whatsappOptIn: dto.whatsappOptIn ?? false,
        nationalIdRef: dto.nationalIdRef,
      });
      guardian = await this.guardians.save(guardian);
    }
    return guardian;
  }

  /** Used by child registration's "search for an existing mother" step. */
  async searchByPhone(phone: string) {
    const guardian = await this.guardians.findOne({ where: { phone: phone.trim() }, relations: ['children'] });
    if (!guardian) return null;

    const pendingMaternalRecord = await this.maternalHealthRecords.findOne({
      where: { guardian: { guardianId: guardian.guardianId }, child: IsNull() },
    });

    return {
      guardianId: guardian.guardianId,
      fullName: guardian.fullName,
      relation: guardian.relation,
      phone: guardian.phone,
      whatsappOptIn: guardian.whatsappOptIn,
      childrenCount: guardian.children?.length ?? 0,
      hasPendingMaternalRecord: Boolean(pendingMaternalRecord),
    };
  }
}
