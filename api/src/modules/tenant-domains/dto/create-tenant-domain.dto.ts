import { IsString, IsUrl, IsBoolean, IsOptional } from 'class-validator';

export class CreateTenantDomainDto {
  @IsString()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: false,
  })
  domain: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
