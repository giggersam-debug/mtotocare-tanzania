import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class RecordAntenatalVisitDto {
  @IsDateString()
  visitDate: string;

  @IsOptional() @IsInt() @Min(4) @Max(45) gestationalAgeWeeks?: number;
  @IsOptional() @IsNumber() @Min(20) @Max(200) weightKg?: number;
  @IsOptional() @IsInt() @Min(50) @Max(250) bpSystolic?: number;
  @IsOptional() @IsInt() @Min(30) @Max(150) bpDiastolic?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(50) fundalHeightCm?: number;
  @IsOptional() @IsBoolean() fetalHeartbeatPresent?: boolean;
  @IsOptional() @IsString() @Length(0, 2000) dangerSigns?: string;

  @IsOptional() @IsIn(['negative', 'trace', 'positive']) urineProtein?: 'negative' | 'trace' | 'positive';
  @IsOptional() @IsIn(['negative', 'trace', 'positive']) urineGlucose?: 'negative' | 'trace' | 'positive';

  @IsOptional() @IsNumber() @Min(0) @Max(25) hemoglobinGdl?: number;

  @IsOptional() @IsBoolean() ironFolicAcidGiven?: boolean;
  @IsOptional() @IsInt() @Min(1) @Max(6) iptpSpDoseGiven?: number;
  @IsOptional() @IsBoolean() dewormingGiven?: boolean;

  @IsOptional() @IsString() @Length(0, 2000) investigationsOrdered?: string;

  @IsOptional()
  @IsDateString()
  nextVisitDate?: string;

  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;
}
