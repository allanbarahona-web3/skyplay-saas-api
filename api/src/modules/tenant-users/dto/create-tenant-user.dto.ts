import { IsEmail, IsString, MinLength, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TenantUserRole } from '@prisma/client';

export class CreateTenantUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TenantUserRole)
  @IsOptional()
  role?: TenantUserRole;
}
