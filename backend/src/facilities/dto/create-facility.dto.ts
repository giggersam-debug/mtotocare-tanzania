import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class CreateFacilityDto {
  @IsString()
  @Length(2, 150)
  name: string;

  @IsIn(['dispensary', 'health_centre', 'hospital'])
  level: 'dispensary' | 'health_centre' | 'hospital';

  @IsString()
  @Length(2, 80)
  region: string;

  @IsString()
  @IsOptional()
  @Length(2, 80)
  district?: string;

  @IsString()
  @Length(2, 30)
  mohCode: string;
}
