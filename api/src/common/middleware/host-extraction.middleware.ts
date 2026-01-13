import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HostExtractionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HostExtractionMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Try to get the host from request header (for direct connections)
      let host = req.get('host');
      
      // If no host or it's ngrok/localhost, check Origin header (shows real origin of request)
      // Origin tells us where the request ACTUALLY came from (e.g., barmentech.com)
      if (!host || host.includes('ngrok') || host.includes('localhost')) {
        const origin = req.get('origin');
        if (origin) {
          // Extract domain from origin (e.g., "https://www.barmentech.com" → "barmentech.com")
          const url = new URL(origin);
          host = url.hostname;
          this.logger.debug(`Using Origin header domain: ${host}`);
        }
      }

      if (!host) {
        // No host or origin header, continue to JWT validation
        // JWT will still validate the token
        return next();
      }

      // Extract domain (remove port if present)
      const domain = host.split(':')[0];

      if (!domain) {
        return next();
      }

      // Look up the domain in TenantDomain table
      // In production, this should be cached with Redis
      const tenantDomain = await this.prisma.tenantDomain.findUnique({
        where: { domain },
        select: {
          tenantId: true,
          isActive: true,
        },
      });

      if (!tenantDomain || !tenantDomain.isActive) {
        // Domain not found or is inactive
        // Continue without req.tenantIdFromHost
        // JWT validation will handle the request
        this.logger.debug(`Domain ${domain} not found or inactive`);
        return next();
      }

      // Store the tenant ID extracted from domain
      // This will be validated by JwtAuthGuard
      req.tenantIdFromHost = tenantDomain.tenantId;
      this.logger.debug(`Extracted tenantId ${tenantDomain.tenantId} from domain ${domain}`);

      next();
    } catch (error) {
      this.logger.error(`Error extracting tenant from host: ${error.message}`);
      // Continue without failing - JWT will validate the request
      next();
    }
  }
}

// Add types to Express Request
declare global {
  namespace Express {
    interface Request {
      tenantIdFromHost?: number;
    }
  }
}
