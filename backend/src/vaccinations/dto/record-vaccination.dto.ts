import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

// Tanzania EPI schedule codes (subset used by the demo seed data / UI).
export const VACCINE_CODES = [
  'BCG',
  'OPV0',
  'OPV1',
  'OPV2',
  'OPV3',
  'PENTA1',
  'PENTA2',
  'PENTA3',
  'PCV1',
  'PCV2',
  'PCV3',
  'ROTA1',
  'ROTA2',
  'IPV',
  'MEASLES_RUBELLA1',
  'MEASLES_RUBELLA2',
  'VITAMIN_A',
  'YELLOW_FEVER',
  'HPV1',
  'HPV2',
] as const;

export class RecordVaccinationDto {
  @IsUUID()
  childId: string;

  @IsIn(VACCINE_CODES)
  vaccineCode: (typeof VACCINE_CODES)[number];

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
