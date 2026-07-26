import { IsBoolean, IsIn, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

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

  @IsString()
  @IsOptional()
  @Length(4, 30)
  nationalIdRef?: string;
}
