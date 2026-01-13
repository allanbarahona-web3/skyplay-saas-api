/**
 * EMAIL CONTROLLER
 * Endpoints para configuración de SMTP por tenant
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { EmailService, EmailOptions } from './email.service';
import { SmtpConfig } from '../tenants/dto/tenant-config.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { ConfigService } from '@nestjs/config';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Configura SMTP para un tenant
   * Solo el dueño (owner) puede hacerlo
   */
  @Post('config/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests/hora
  async configureSmtp(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Body() smtpConfig: SmtpConfig,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    // Validar que el usuario es dueño del tenant
    if (req.user.tenantId !== tenantId) {
      throw new ForbiddenException('You can only configure your own tenant');
    }

    // Validar que el tenant existe
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { config: true },
    });

    if (!tenant) {
      throw new BadRequestException(`Tenant ${tenantId} not found`);
    }

    // Encriptar datos sensibles
    const encryptedConfig = { ...smtpConfig };
    const secret = this.configService.get<string>('JWT_SECRET');

    if (encryptedConfig.auth?.pass && !encryptedConfig.auth.pass.startsWith('encrypted:')) {
      encryptedConfig.auth.pass = `encrypted:${await this.cryptoService.encrypt(
        encryptedConfig.auth.pass,
        secret,
      )}`;
    }

    if (encryptedConfig.apiKey && !encryptedConfig.apiKey.startsWith('encrypted:')) {
      encryptedConfig.apiKey = `encrypted:${await this.cryptoService.encrypt(
        encryptedConfig.apiKey,
        secret,
      )}`;
    }

    // Actualizar config del tenant
    const currentConfig = (tenant.config as Record<string, any>) || {};
    const updatedConfig = {
      ...currentConfig,
      email: encryptedConfig,
    };

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { config: updatedConfig },
    });

    // Limpiar cache de transporters
    this.emailService.clearTransporterCache(tenantId);

    return {
      success: true,
      message: 'Email configuration saved successfully',
    };
  }

  /**
   * Obtiene configuración SMTP del tenant (sin passwords)
   */
  @Get('config/:tenantId')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests/minuto
  async getSmtpConfig(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Request() req,
  ): Promise<any> {
    // Solo propietario puede ver
    if (req.user.tenantId !== tenantId) {
      throw new ForbiddenException('You can only view your own configuration');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { config: true },
    });

    const currentConfig = (tenant?.config as Record<string, any>) || {};
    if (!currentConfig.email) {
      return {
        configured: false,
        message: 'No email configuration found',
      };
    }

    // Ocultar datos sensibles
    const config = { ...currentConfig.email };
    if (config.auth?.pass) {
      config.auth.pass = '***';
    }
    if (config.apiKey) {
      config.apiKey = '***';
    }

    return {
      configured: true,
      data: config,
    };
  }

  /**
   * Verifica que la configuración SMTP es válida
   */
  @Post('verify/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests/minuto
  async verifySmtpConfig(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Request() req,
  ): Promise<{ valid: boolean; message: string; error?: string }> {
    // Validar que el usuario es dueño del tenant
    if (req.user.tenantId !== tenantId) {
      throw new ForbiddenException('You can only verify your own configuration');
    }

    try {
      const valid = await this.emailService.verifySMTPConfig(tenantId);

      if (valid) {
        return {
          valid: true,
          message: 'SMTP configuration is working correctly',
        };
      } else {
        return {
          valid: false,
          message: 'SMTP configuration verification failed',
        };
      }
    } catch (error) {
      return {
        valid: false,
        message: 'Error verifying configuration',
        error: error.message,
      };
    }
  }

  /**
   * Envía un email de prueba
   */
  @Post('test/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests/minuto
  async sendTestEmail(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Body('recipientEmail') recipientEmail: string,
    @Request() req,
  ): Promise<{ success: boolean; message: string; error?: string }> {
    // Validar que el usuario es dueño del tenant
    if (req.user.tenantId !== tenantId) {
      throw new ForbiddenException('You can only test your own configuration');
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      throw new BadRequestException('Valid email address required');
    }

    try {
      const result = await this.emailService.sendEmail({
        tenantId,
        to: recipientEmail,
        subject: '🧪 Email Configuration Test - Barmentech SaaS',
        html: `
          <h2>Email Configuration Test</h2>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <hr />
          <small>This is a test email sent at ${new Date().toISOString()}</small>
        `,
      });

      return {
        success: true,
        message: `Test email sent to ${recipientEmail}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send test email',
        error: error.message,
      };
    }
  }

  /**
   * Desactiva la configuración de email (sin eliminarla)
   */
  @Post('disable/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 requests/hora
  async disableEmailConfig(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    // Validar que el usuario es dueño del tenant
    if (req.user.tenantId !== tenantId) {
      throw new ForbiddenException('You can only configure your own tenant');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { config: true },
    });

    const currentConfig = (tenant?.config as Record<string, any>) || {};
    if (!currentConfig.email) {
      throw new BadRequestException('No email configuration found');
    }

    const updatedConfig = {
      ...currentConfig,
      email: {
        ...currentConfig.email,
        isActive: false,
      },
    };

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { config: updatedConfig },
    });

    this.emailService.clearTransporterCache(tenantId);

    return {
      success: true,
      message: 'Email configuration disabled',
    };
  }
}
