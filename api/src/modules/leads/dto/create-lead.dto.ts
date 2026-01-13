import { IsString, IsEmail, IsOptional, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Sanitiza strings removiendo caracteres peligrosos
 * Permite espacios, números, letras, guiones, puntos, @, etc.
 */
function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') return value;
  // Remover HTML tags y caracteres de control
  return value
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

export class CreateLeadDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => sanitizeString(value))
  businessName?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => sanitizeString(value))
  fullName: string;

  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => sanitizeString(value))
  whatsappNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => sanitizeString(value))
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => sanitizeString(value))
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => sanitizeString(value))
  currentSetup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => sanitizeString(value))
  budgetRange?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => sanitizeString(value))
  salesFollowUpPerson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => sanitizeString(value))
  mostImportantRightNow?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => sanitizeString(value))
  commitment2To3Months?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => sanitizeString(value))
  biggestPainPoint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => sanitizeString(value))
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => sanitizeString(value))
  service?: string;
}
