import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantDomainsService } from './tenant-domains.service';
import { CreateTenantDomainDto } from './dto/create-tenant-domain.dto';

@Controller('tenant-domains')
@UseGuards(JwtAuthGuard)
export class TenantDomainsController {
  constructor(private readonly tenantDomainsService: TenantDomainsService) {}

  /**
   * Create a new custom domain
   */
  @Post()
  @Throttle({ default: { limit: 5, ttl: 3600 } }) // 5 domains per hour
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() tenantId: number,
    @Body() createDomainDto: CreateTenantDomainDto,
  ) {
    return this.tenantDomainsService.createDomain(tenantId, createDomainDto);
  }

  /**
   * Get all domains for tenant
   */
  @Get()
  @SkipThrottle()
  async findAll(@CurrentTenant() tenantId: number) {
    return this.tenantDomainsService.findAllByTenant(tenantId);
  }

  /**
   * Get primary domain for tenant
   */
  @Get('primary')
  @SkipThrottle()
  async findPrimary(@CurrentTenant() tenantId: number) {
    return this.tenantDomainsService.findPrimaryDomain(tenantId);
  }

  /**
   * Set a domain as primary
   */
  @Patch(':id/set-primary')
  @Throttle({ default: { limit: 10, ttl: 3600 } }) // 10 changes per hour
  async setAsPrimary(
    @CurrentTenant() tenantId: number,
    @Param('id', ParseIntPipe) domainId: number,
  ) {
    return this.tenantDomainsService.setAsPrimary(tenantId, domainId);
  }

  /**
   * Verify a custom domain
   * Query param: verificationToken
   */
  @Patch(':id/verify')
  @Throttle({ default: { limit: 20, ttl: 3600 } }) // 20 attempts per hour
  async verify(
    @CurrentTenant() tenantId: number,
    @Param('id', ParseIntPipe) domainId: number,
  ) {
    // In a real app, the verification token would come from a DNS record check
    // For now, we require it as a header or query param
    const token = 'verified'; // This would come from DNS check
    return this.tenantDomainsService.verifyCustomDomain(
      tenantId,
      domainId,
      token,
    );
  }

  /**
   * Enable/Disable a domain
   */
  @Patch(':id/toggle-active')
  @Throttle({ default: { limit: 20, ttl: 3600 } })
  async toggleActive(
    @CurrentTenant() tenantId: number,
    @Param('id', ParseIntPipe) domainId: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.tenantDomainsService.toggleDomainActive(
      tenantId,
      domainId,
      isActive,
    );
  }

  /**
   * Remove a domain
   */
  @Delete(':id')
  @Throttle({ default: { limit: 10, ttl: 3600 } }) // 10 deletions per hour
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentTenant() tenantId: number,
    @Param('id', ParseIntPipe) domainId: number,
  ) {
    await this.tenantDomainsService.removeDomain(tenantId, domainId);
  }
}
