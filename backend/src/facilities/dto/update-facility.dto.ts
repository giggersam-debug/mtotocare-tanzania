import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class UpdateFacilityDto {
  @IsString()
  @IsOptional()
  @Length(2, 150)
  name?: string;

  @IsIn(['dispensary', 'health_centre', 'hospital'])
  @IsOptional()
  level?: 'dispensary' | 'health_centre' | 'hospital';

  @IsString()
  @IsOptional()
  @Length(2, 80)
  region?: string;

  @IsString()
  @IsOptional()
  @Length(2, 30)
  mohCode?: string;
}
