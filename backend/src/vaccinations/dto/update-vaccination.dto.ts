import { IsDateString, IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { VACCINE_CODES } from './record-vaccination.dto';

export class UpdateVaccinationDto {
  @IsIn(VACCINE_CODES)
  @IsOptional()
  vaccineCode?: (typeof VACCINE_CODES)[number];

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  doseNumber?: number;

  @IsDateString()
  @IsOptional()
  administeredAt?: string;

  @IsString()
  @IsOptional()
  @Length(1, 40)
  batchNumber?: string;

  @IsString()
  @IsOptional()
  @Length(1, 300)
  notes?: string;
}
