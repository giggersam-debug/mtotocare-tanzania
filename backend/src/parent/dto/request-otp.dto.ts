import { IsString, Length } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @Length(1, 64)
  qrToken: string;

  @IsString()
  @Length(6, 20)
  phone: string;
}
