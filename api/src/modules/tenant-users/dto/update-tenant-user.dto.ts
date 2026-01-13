import { IsString, IsEnum, IsOptional } from 'class-validator';
import { TenantUserRole, UserStatus } from '@prisma/client';

export class UpdateTenantUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(TenantUserRole)
  @IsOptional()
  role?: TenantUserRole;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
