import { IsString, IsNotEmpty, IsInt, Min, IsEnum, IsOptional } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsInt()
  @Min(1)
  amount: number; // En centavos

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsString()
  @IsOptional()
  providerPaymentId?: string;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}
