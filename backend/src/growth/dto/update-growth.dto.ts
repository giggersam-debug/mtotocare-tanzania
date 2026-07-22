import { IsDateString, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateGrowthDto {
  @IsDateString()
  @IsOptional()
  visitDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0.5)
  @Max(60)
  weightKg?: number;

  @IsNumber()
  @IsOptional()
  @Min(20)
  @Max(150)
  heightCm?: number;

  @IsNumber()
  @IsOptional()
  @Min(5)
  @Max(30)
  muacCm?: number;

  @IsString()
  @IsOptional()
  @Length(1, 300)
  notes?: string;
}
