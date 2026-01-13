import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDomainDto } from './dto/create-tenant-domain.dto';

@Injectable()
export class TenantDomainsService {
  private readonly logger = new Logger(TenantDomainsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new custom domain for a tenant
   * Validates uniqueness, handles primary domain logic
   */
  async createDomain(
    tenantId: number,
    dto: CreateTenantDomainDto,
  ): Promise<any> {
    this.logger.debug(`Creating domain ${dto.domain} for tenant ${tenantId}`);

    // Validate tenant exists
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    // Check if domain is already in use (globally)
    const existingDomain = await this.prisma.tenantDomain.findUnique({
      where: { domain: dto.domain },
    });
    if (existingDomain) {
      throw new ConflictException(
        `Domain ${dto.domain} is already registered`,
      );
    }

    // Get current primary domain count
    const primaryCount = await this.prisma.tenantDomain.count({
      where: { tenantId, isPrimary: true },
    });

    // If this is the first domain or marked as primary, set it as primary
    const shouldBePrimary = primaryCount === 0 || dto.isPrimary === true;

    // If marking as primary, remove primary flag from existing
    if (shouldBePrimary && primaryCount > 0) {
      await this.prisma.tenantDomain.updateMany({
        where: { tenantId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Create the domain
    const newDomain = await this.prisma.tenantDomain.create({
      data: {
        tenantId,
        domain: dto.domain.toLowerCase(),
        isPrimary: shouldBePrimary,
        isActive: true,
        verificationToken: this.generateVerificationToken(),
      },
    });

    this.logger.log(`Domain ${dto.domain} created for tenant ${tenantId}`);

    return {
      id: newDomain.id,
      domain: newDomain.domain,
      isPrimary: newDomain.isPrimary,
      isActive: newDomain.isActive,
      verificationToken: newDomain.verificationToken,
      verifiedAt: newDomain.verifiedAt,
    };
  }

  /**
   * Get all domains for a tenant
   */
  async findAllByTenant(tenantId: number): Promise<any[]> {
    const domains = await this.prisma.tenantDomain.findMany({
      where: { tenantId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        domain: true,
        isPrimary: true,
        isActive: true,
        verifiedAt: true,
        createdAt: true,
      },
    });

    return domains;
  }

  /**
   * Get the primary domain for a tenant
   */
  async findPrimaryDomain(tenantId: number): Promise<any> {
    const primaryDomain = await this.prisma.tenantDomain.findFirst({
      where: { tenantId, isPrimary: true },
      select: {
        id: true,
        domain: true,
        isActive: true,
        verifiedAt: true,
      },
    });

    if (!primaryDomain) {
      throw new NotFoundException(`No primary domain configured for tenant`);
    }

    return primaryDomain;
  }

  /**
   * Set a domain as primary
   * Only one domain per tenant can be primary
   */
  async setAsPrimary(
    tenantId: number,
    domainId: number,
  ): Promise<any> {
    // Verify domain exists and belongs to tenant
    const domain = await this.prisma.tenantDomain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      throw new NotFoundException(`Domain ${domainId} not found`);
    }

    if (domain.tenantId !== tenantId) {
      throw new ForbiddenException(
        `Domain does not belong to this tenant`,
      );
    }

    // Remove primary flag from all other domains
    await this.prisma.tenantDomain.updateMany({
      where: { tenantId, id: { not: domainId } },
      data: { isPrimary: false },
    });

    // Set this domain as primary
    const updated = await this.prisma.tenantDomain.update({
      where: { id: domainId },
      data: { isPrimary: true },
      select: {
        id: true,
        domain: true,
        isPrimary: true,
        isActive: true,
      },
    });

    this.logger.log(`Domain ${domain.domain} set as primary for tenant ${tenantId}`);

    return updated;
  }

  /**
   * Remove a domain from a tenant
   * Cannot remove the last domain
   */
  async removeDomain(tenantId: number, domainId: number): Promise<void> {
    // Verify domain exists and belongs to tenant
    const domain = await this.prisma.tenantDomain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      throw new NotFoundException(`Domain ${domainId} not found`);
    }

    if (domain.tenantId !== tenantId) {
      throw new ForbiddenException(
        `Domain does not belong to this tenant`,
      );
    }

    // Check if this is the last domain
    const domainCount = await this.prisma.tenantDomain.count({
      where: { tenantId },
    });

    if (domainCount === 1) {
      throw new BadRequestException(
        `Cannot remove the last domain. A tenant must have at least one domain.`,
      );
    }

    // If removing primary domain, set the oldest domain as primary
    if (domain.isPrimary) {
      const oldestDomain = await this.prisma.tenantDomain.findFirst({
        where: { tenantId, id: { not: domainId } },
        orderBy: { createdAt: 'asc' },
      });

      if (oldestDomain) {
        await this.prisma.tenantDomain.update({
          where: { id: oldestDomain.id },
          data: { isPrimary: true },
        });
      }
    }

    // Delete the domain
    await this.prisma.tenantDomain.delete({
      where: { id: domainId },
    });

    this.logger.log(`Domain ${domain.domain} removed from tenant ${tenantId}`);
  }

  /**
   * Verify a custom domain (simulates DNS verification)
   * Sets verifiedAt timestamp
   */
  async verifyCustomDomain(
    tenantId: number,
    domainId: number,
    verificationToken: string,
  ): Promise<any> {
    const domain = await this.prisma.tenantDomain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      throw new NotFoundException(`Domain ${domainId} not found`);
    }

    if (domain.tenantId !== tenantId) {
      throw new ForbiddenException(
        `Domain does not belong to this tenant`,
      );
    }

    // Verify token matches
    if (domain.verificationToken !== verificationToken) {
      throw new BadRequestException(`Invalid verification token`);
    }

    // Mark as verified
    const verified = await this.prisma.tenantDomain.update({
      where: { id: domainId },
      data: { verifiedAt: new Date() },
      select: {
        id: true,
        domain: true,
        verifiedAt: true,
      },
    });

    this.logger.log(`Domain ${domain.domain} verified for tenant ${tenantId}`);

    return verified;
  }

  /**
   * Get domain by domain name (used by HostExtractionMiddleware)
   */
  async findByDomain(domain: string): Promise<any> {
    return this.prisma.tenantDomain.findUnique({
      where: { domain: domain.toLowerCase() },
      select: {
        id: true,
        tenantId: true,
        domain: true,
        isPrimary: true,
        isActive: true,
        verifiedAt: true,
      },
    });
  }

  /**
   * Check if domain is verified and active
   */
  async isDomainVerified(domain: string): Promise<boolean> {
    const tenantDomain = await this.prisma.tenantDomain.findUnique({
      where: { domain: domain.toLowerCase() },
    });

    return tenantDomain?.verifiedAt !== null && tenantDomain?.isActive === true;
  }

  /**
   * Disable/enable a domain without deleting it
   */
  async toggleDomainActive(
    tenantId: number,
    domainId: number,
    isActive: boolean,
  ): Promise<any> {
    const domain = await this.prisma.tenantDomain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      throw new NotFoundException(`Domain ${domainId} not found`);
    }

    if (domain.tenantId !== tenantId) {
      throw new ForbiddenException(
        `Domain does not belong to this tenant`,
      );
    }

    // Cannot disable if it's the only active domain
    if (!isActive && domain.isPrimary) {
      const activeCount = await this.prisma.tenantDomain.count({
        where: { tenantId, isActive: true },
      });

      if (activeCount === 1) {
        throw new BadRequestException(
          `Cannot disable the primary domain when it's the only active domain`,
        );
      }

      // Set another domain as primary before disabling
      const anotherDomain = await this.prisma.tenantDomain.findFirst({
        where: { tenantId, isActive: true, id: { not: domainId } },
        orderBy: { createdAt: 'asc' },
      });

      if (anotherDomain) {
        await this.prisma.tenantDomain.update({
          where: { id: anotherDomain.id },
          data: { isPrimary: true },
        });
      }
    }

    const updated = await this.prisma.tenantDomain.update({
      where: { id: domainId },
      data: { isActive },
      select: {
        id: true,
        domain: true,
        isActive: true,
        isPrimary: true,
      },
    });

    this.logger.log(
      `Domain ${domain.domain} ${isActive ? 'enabled' : 'disabled'} for tenant ${tenantId}`,
    );

    return updated;
  }

  /**
   * Generate verification token for domain ownership
   */
  private generateVerificationToken(): string {
    return `verify_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
