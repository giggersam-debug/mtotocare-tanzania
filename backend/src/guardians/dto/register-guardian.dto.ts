import { IsBoolean, IsIn, IsOptional, IsPhoneNumber, IsString, Length, Matches, ValidateIf } from 'class-validator';

// Tanzania NIDA number, as printed on the physical ID card:
// YYYYMMDD-XXXXX-XXXXX-XX (8-5-5-2 digits).
const NIDA_PATTERN = /^\d{8}-\d{5}-\d{5}-\d{2}$/;

export class RegisterGuardianDto {
  @IsString()
  @Length(2, 150)
  fullName: string;

  @IsIn(['mother', 'father', 'guardian'])
  relation: 'mother' | 'father' | 'guardian';

  @IsPhoneNumber('TZ')
  phone: string;

  @IsBoolean()
  @IsOptional()
  whatsappOptIn?: boolean;

  // Mandatory for a mother/father record — a generic "guardian" (e.g. a
  // relative standing in) may not have one on hand, so it stays optional
  // there.
  @ValidateIf((o) => o.relation !== 'guardian')
  @IsString()
  @Matches(NIDA_PATTERN, { message: 'nationalIdRef must be in the format YYYYMMDD-XXXXX-XXXXX-XX' })
  nationalIdRef?: string;

  @IsString()
  @Length(2, 100)
  occupation: string;

  @IsString()
  @Length(2, 200)
  residence: string;
}
