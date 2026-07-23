import { IsIn, IsString, Length } from 'class-validator';

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
  @Length(2, 30)
  mohCode: string;
}
