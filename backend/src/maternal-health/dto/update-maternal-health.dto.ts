import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateMaternalHealthDto {
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

  @IsOptional()
  @IsIn(['vaginal', 'cesarean', 'assisted'])
  deliveryMode?: 'vaginal' | 'cesarean' | 'assisted';

  @IsOptional() @IsInt() @Min(0) @Max(10) apgarScore?: number;

  @IsOptional() @IsString() @Length(0, 2000) deliveryComplications?: string;
  @IsOptional() @IsString() @Length(0, 2000) geneticFamilyHistory?: string;
  @IsOptional() @IsString() @Length(0, 4000) clinicalNotes?: string;

  @IsOptional() @IsBoolean() consentGiven?: boolean;
}
