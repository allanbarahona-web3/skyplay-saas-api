import { Module } from '@nestjs/common';
import { TenantDomainsService } from './tenant-domains.service';
import { TenantDomainsController } from './tenant-domains.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TenantDomainsController],
  providers: [TenantDomainsService],
  exports: [TenantDomainsService],
})
export class TenantDomainsModule {}
