import { IsBoolean, IsIn, IsOptional, IsPhoneNumber, IsString, Length, ValidateIf } from 'class-validator';

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
  @Length(4, 30)
  nationalIdRef?: string;

  @IsString()
  @Length(2, 100)
  occupation: string;

  @IsString()
  @Length(2, 200)
  residence: string;
}
