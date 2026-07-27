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
        occupation: dto.occupation,
        residence: dto.residence,
      });
      guardian = await this.guardians.save(guardian);
    }
    return guardian;
  }

  /**
   * Used by child registration's "search for an existing mother" step —
   * National ID is the primary lookup (matches how she'd be identified at
   * a real clinic); phone remains a fallback for the (rarer) case where
   * she doesn't have her ID on hand, or is a "guardian" relation who was
   * never required to have one on file.
   */
  async searchByNationalId(nationalIdRef: string) {
    const guardian = await this.guardians.findOne({
      where: { nationalIdRef: nationalIdRef.trim() },
      relations: ['children'],
    });
    return guardian ? this.toSearchResult(guardian) : null;
  }

  /** Fallback lookup when the mother doesn't have her National ID on hand. */
  async searchByPhone(phone: string) {
    const guardian = await this.guardians.findOne({ where: { phone: phone.trim() }, relations: ['children'] });
    return guardian ? this.toSearchResult(guardian) : null;
  }

  private async toSearchResult(guardian: Guardian) {
    const pendingMaternalRecord = await this.maternalHealthRecords.findOne({
      where: { guardian: { guardianId: guardian.guardianId }, child: IsNull() },
    });

    return {
      guardianId: guardian.guardianId,
      fullName: guardian.fullName,
      relation: guardian.relation,
      phone: guardian.phone,
      whatsappOptIn: guardian.whatsappOptIn,
      nationalIdRef: guardian.nationalIdRef,
      occupation: guardian.occupation,
      residence: guardian.residence,
      childrenCount: guardian.children?.length ?? 0,
      hasPendingMaternalRecord: Boolean(pendingMaternalRecord),
    };
  }
}
