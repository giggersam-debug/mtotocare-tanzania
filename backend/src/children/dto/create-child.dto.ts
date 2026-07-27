import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// Tanzania NIDA number, as printed on the physical ID card:
// YYYYMMDD-XXXXX-XXXXX-XX (8-5-5-2 digits).
const NIDA_PATTERN = /^\d{8}-\d{5}-\d{5}-\d{2}$/;

class GuardianDto {
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

  // These three are only actually collected when this guardian is being
  // newly created here (the frontend requires them on that branch of the
  // form). When the phone number matches an existing guardian, the record
  // on file is reused as-is and none of this is re-collected — so they stay
  // optional at the DTO level rather than blocking that path.
  @IsOptional()
  @IsString()
  @Matches(NIDA_PATTERN, { message: 'nationalIdRef must be in the format YYYYMMDD-XXXXX-XXXXX-XX' })
  nationalIdRef?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  occupation?: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  residence?: string;
}

export class CreateChildDto {
  @IsString()
  @Length(2, 150)
  fullName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsIn(['male', 'female'])
  sex: 'male' | 'female';

  @IsNumber()
  @IsOptional()
  @Min(0.5)
  @Max(8)
  birthWeightKg?: number;

  @IsNumber()
  @IsOptional()
  @Min(20)
  @Max(65)
  birthHeightCm?: number;

  @IsString()
  @IsOptional()
  birthFacilityId?: string;

  @IsString() @IsOptional() region?: string;
  @IsString() @IsOptional() district?: string;
  @IsString() @IsOptional() ward?: string;
  @IsString() @IsOptional() village?: string;

  @IsString()
  @IsOptional()
  @Length(6, 30)
  birthRegistrationNumber?: string;

  @ValidateNested()
  @Type(() => GuardianDto)
  guardian: GuardianDto;

  // Optional second parent (typically the father when `guardian` above is
  // the mother) captured during pregnancy/registration. Either parent's
  // phone can later be used to request Parent Portal access.
  @IsOptional()
  @ValidateNested()
  @Type(() => GuardianDto)
  secondGuardian?: GuardianDto;
}
