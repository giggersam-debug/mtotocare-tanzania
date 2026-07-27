import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

// Same clinical fields as RecordMaternalHealthDto, but keyed to a guardian
// instead of a child — used by the standalone Mother Registration page,
// before the baby is born.
export class RecordMaternalHealthForGuardianDto {
  @IsUUID()
  guardianId: string;

  @IsOptional() @IsInt() @Min(0) gravida?: number;
  @IsOptional() @IsInt() @Min(0) para?: number;
  @IsOptional() @IsDateString() estimatedDueDate?: string;
  @IsOptional() @IsInt() @Min(0) ancVisits?: number;
  @IsOptional() @IsInt() @Min(0) gestationalAgeWeeks?: number;

  @IsOptional() @IsBoolean() gestationalDiabetes?: boolean;
  @IsOptional() @IsBoolean() hypertension?: boolean;
  @IsOptional() @IsBoolean() anemia?: boolean;
  @IsOptional() @IsBoolean() malariaInPregnancy?: boolean;

  @IsOptional()
  @IsIn(['positive', 'negative', 'unknown'])
  hivStatus?: 'positive' | 'negative' | 'unknown';

  @IsOptional()
  @IsIn(['good', 'fair', 'poor', 'n/a'])
  artAdherence?: 'good' | 'fair' | 'poor' | 'n/a';

  @IsOptional() @IsString() @Length(0, 2000) geneticFamilyHistory?: string;
  @IsOptional() @IsString() @Length(0, 4000) clinicalNotes?: string;

  // Consent must be explicitly true to record this data at all — enforced
  // again in the service as a hard gate, not just client-side validation.
  @IsBoolean()
  consentGiven: boolean;
}
