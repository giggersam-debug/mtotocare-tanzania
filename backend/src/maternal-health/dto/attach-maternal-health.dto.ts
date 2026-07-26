import { IsUUID } from 'class-validator';

export class AttachMaternalHealthDto {
  @IsUUID()
  guardianId: string;

  @IsUUID()
  childId: string;
}
