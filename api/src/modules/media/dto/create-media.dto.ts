import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';

export enum EntityType {
  CATEGORY = 'category',
  PRODUCT = 'product',
  TENANT_BRANDING = 'tenant_branding',
  HERO = 'hero',
}

export class CreateMediaDto {
  @IsInt()
  tenantId: number;

  @IsEnum(EntityType)
  entityType: string;

  @IsString()
  entityId: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
