import { IsEmail, IsString, MinLength, IsNotEmpty, IsEnum, IsOptional, IsInt } from 'class-validator';
import { TenantUserRole } from '@prisma/client';

export class RegisterDto {
  @IsInt()
  @IsNotEmpty()
  tenantId: number;

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
