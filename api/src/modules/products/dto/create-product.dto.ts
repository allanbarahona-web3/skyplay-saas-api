import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';
import { ProductKind } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  categoryId?: string; // ID de la categoría

  @IsEnum(ProductKind)
  @IsOptional()
  productKind?: ProductKind;

  @IsInt()
  @Min(0)
  price: number; // En centavos

  @IsString()
  @IsOptional()
  currency?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsOptional()
  metadata?: any;
}
