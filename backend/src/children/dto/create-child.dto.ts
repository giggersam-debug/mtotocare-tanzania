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
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

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

  @IsString()
  @IsOptional()
  @Length(4, 30)
  nationalIdRef?: string;
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
}
