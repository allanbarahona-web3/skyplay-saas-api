import { IsEmail, IsString, IsNotEmpty, IsInt } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsInt()
  @IsNotEmpty()
  tenantId: number;
}
