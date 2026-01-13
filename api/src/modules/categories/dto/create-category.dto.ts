import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @IsOptional()
  @IsInt()
  tenantId?: number; // Optional - viene del JWT

  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}
