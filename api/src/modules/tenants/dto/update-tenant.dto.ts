import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TenantStatus, BillingStatus } from '@prisma/client';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @IsEnum(BillingStatus)
  @IsOptional()
  billingStatus?: BillingStatus;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsOptional()
  config?: any;
}
