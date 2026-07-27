import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class RecordAntenatalVisitDto {
  @IsDateString()
  visitDate: string;

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
