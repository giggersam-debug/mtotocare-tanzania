import { IsIn, IsPhoneNumber, IsString, Length } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @Length(3, 60)
  username: string;

  @IsString()
  @Length(8, 100)
  password: string;

  @IsString()
  @Length(2, 150)
  fullName: string;

  @IsPhoneNumber('TZ')
  phone: string;

  // Administrators create front-line staff accounts only — 'administrator'
  // and 'ministry' accounts stay seed/migration-only to avoid privilege
  // escalation through this endpoint.
  @IsIn(['nurse', 'doctor', 'nutritionist', 'pharmacist'])
  role: 'nurse' | 'doctor' | 'nutritionist' | 'pharmacist';
}
