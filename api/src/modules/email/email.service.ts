/**
 * EMAIL SERVICE - Multi-tenant SMTP Support + SendGrid Integration
 * 
 * Envía emails dinámicamente usando configuración SMTP de cada tenant
 * Soporta SMTP estándar, SendGrid, Mailgun, AWS SES
 * Integrado con plantillas Handlebars para leads
 */

import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailService as SendGridMailService } from '@sendgrid/mail';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';

export interface EmailOptions {
  tenantId: number;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: any[];
}

export interface EmailTemplate {
  templateName: string;
  variables: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporters: Map<number, nodemailer.Transporter> = new Map();
  private readonly templatesDir: string;
  private sgMail: SendGridMailService;

  private getTemplatesDir(): string {
    // En desarrollo: busca en src/, en producción: busca en dist/
    const distPath = path.join(__dirname, 'templates');
    const srcPath = path.join(process.cwd(), 'src', 'modules', 'email', 'templates');
    if (fs.existsSync(distPath)) return distPath;
    if (fs.existsSync(srcPath)) return srcPath;
    return distPath; // fallback
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {
    this.templatesDir = this.getTemplatesDir();
    // Inicializar SendGrid con API Key si está disponible
    if (process.env.SENDGRID_API_KEY) {
      this.sgMail = new SendGridMailService();
      this.sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  /**
   * Envía un email usando configuración SMTP del tenant
   */
  async sendEmail(options: EmailOptions): Promise<{ messageId: string; success: boolean }> {
    try {
      // 1. Obtener configuración SMTP del tenant
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: options.tenantId },
        select: { config: true, name: true },
      });

      if (!tenant) {
        throw new BadRequestException(`Tenant ${options.tenantId} not found`);
      }

      // 2. Validar que existe configuración de email
      const currentConfig = (tenant.config as Record<string, any>) || {};
      const emailConfig = currentConfig.email;
      if (!emailConfig || !emailConfig.isActive) {
        throw new BadRequestException(
          `Email not configured for tenant ${options.tenantId}`,
        );
      }

      // 3. Obtener o crear transporter
      const transporter = await this.getOrCreateTransporter(options.tenantId, emailConfig);

      // 4. Preparar opciones de email
      const mailOptions = {
        from: `${emailConfig.fromName} <${emailConfig.fromAddress}>`,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || emailConfig.replyToAddress,
      };

      // 5. Enviar email
      this.logger.log(`Sending email to ${options.to} for tenant ${options.tenantId}`);
      const info = await transporter.sendMail(mailOptions);

      this.logger.log(`Email sent successfully. MessageId: ${info.messageId}`);
      return {
        messageId: info.messageId,
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Envía email basado en template
   */
  async sendEmailFromTemplate(
    options: Omit<EmailOptions, 'html' | 'text'>,
    template: EmailTemplate,
  ): Promise<{ messageId: string; success: boolean }> {
    // TODO: Implementar carga y renderizado de templates
    // Por ahora, retornar error
    throw new BadRequestException('Template emails not yet implemented');
  }

  /**
   * Obtiene o crea transporter para el tenant
   * Cachea transporters en memoria para evitar recrearlos
   */
  private async getOrCreateTransporter(
    tenantId: number,
    emailConfig: any,
  ): Promise<nodemailer.Transporter> {
    // Si ya existe en cache, devolverlo
    if (this.transporters.has(tenantId)) {
      return this.transporters.get(tenantId);
    }

    let transporter: nodemailer.Transporter;

    switch (emailConfig.provider) {
      case 'smtp':
        transporter = await this.createSmtpTransporter(emailConfig);
        break;

      case 'sendgrid':
        transporter = await this.createSendGridTransporter(emailConfig);
        break;

      case 'mailgun':
        transporter = await this.createMailgunTransporter(emailConfig);
        break;

      case 'aws-ses':
        transporter = await this.createAwsSesTransporter(emailConfig);
        break;

      default:
        throw new BadRequestException(
          `Email provider ${emailConfig.provider} not supported`,
        );
    }

    // Cachear
    this.transporters.set(tenantId, transporter);

    // Limpiar cache después de 24 horas
    setTimeout(() => {
      this.transporters.delete(tenantId);
    }, 24 * 60 * 60 * 1000);

    return transporter;
  }

  /**
   * Crea transporter SMTP estándar
   */
  private async createSmtpTransporter(config: any): Promise<nodemailer.Transporter> {
    if (!config.host || !config.port) {
      throw new BadRequestException('SMTP host and port required');
    }

    // Desencriptar password si está encriptado
    const secret = this.configService.get<string>('JWT_SECRET');
    const password = config.auth?.pass.startsWith('encrypted:')
      ? await this.cryptoService.decrypt(config.auth.pass.replace('encrypted:', ''), secret)
      : config.auth?.pass;

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure || false,
      auth: {
        user: config.auth?.user,
        pass: password,
      },
    });
  }

  /**
   * Crea transporter SendGrid
   */
  private async createSendGridTransporter(config: any): Promise<nodemailer.Transporter> {
    if (!config.apiKey) {
      throw new BadRequestException('SendGrid API key required');
    }

    const secret = this.configService.get<string>('JWT_SECRET');
    const apiKey = config.apiKey.startsWith('encrypted:')
      ? await this.cryptoService.decrypt(config.apiKey.replace('encrypted:', ''), secret)
      : config.apiKey;

    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: apiKey,
      },
    });
  }

  /**
   * Crea transporter Mailgun
   */
  private async createMailgunTransporter(config: any): Promise<nodemailer.Transporter> {
    if (!config.apiKey || !config.domain) {
      throw new BadRequestException('Mailgun API key and domain required');
    }

    const secret = this.configService.get<string>('JWT_SECRET');
    const apiKey = config.apiKey.startsWith('encrypted:')
      ? await this.cryptoService.decrypt(config.apiKey.replace('encrypted:', ''), secret)
      : config.apiKey;

    return nodemailer.createTransport({
      host: `smtp.mailgun.org`,
      port: 587,
      secure: false,
      auth: {
        user: `postmaster@${config.domain}`,
        pass: apiKey,
      },
    });
  }

  /**
   * Crea transporter AWS SES
   * Requiere AWS SDK v3
   */
  private async createAwsSesTransporter(config: any): Promise<nodemailer.Transporter> {
    // TODO: Implementar AWS SES
    throw new BadRequestException('AWS SES not yet implemented');
  }

  /**
   * Verifica que la configuración SMTP es válida
   */
  async verifySMTPConfig(tenantId: number): Promise<boolean> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { config: true },
      });

      const currentConfig = (tenant?.config as Record<string, any>) || {};
      if (!currentConfig.email) {
        return false;
      }

      const transporter = await this.getOrCreateTransporter(tenantId, currentConfig.email);
      await transporter.verify();

      this.logger.log(`SMTP config verified for tenant ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`SMTP verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Limpia cache de transporters
   */
  clearTransporterCache(tenantId?: number): void {
    if (tenantId) {
      this.transporters.delete(tenantId);
    } else {
      this.transporters.clear();
    }
  }

  /**
   * ==================== LEAD EMAIL METHODS ====================
   */

  /**
   * Carga y compila una plantilla HTML con variables
   * Soporta múltiples idiomas: 
   * - Si language='es' o no viene especificado, usa {templateName}.html (template base en español)
   * - Si language='en', intenta cargar {templateName}-en.html
   * - Si el archivo no existe, cae a {templateName}.html
   */
  private loadAndCompileTemplate(
    templateName: string,
    variables: Record<string, any>,
    language?: string,
  ): string {
    try {
      let filename = `${templateName}.html`; // Default: español (sin sufijo)
      
      // Si viene un idioma especificado Y NO es español, intentar cargar variante localizada
      if (language && language.trim() !== '') {
        // Normalizar: convertir a minúsculas y extraer código de idioma principal
        // Ej: 'en-US' -> 'en', 'es-ES' -> 'es'
        const normalizedLang = language.toLowerCase().trim().split('-')[0];
        
        // Solo buscar sufijo si es distinto de 'es' (español es el default sin sufijo)
        if (normalizedLang !== 'es') {
          const languageFilename = `${templateName}-${normalizedLang}.html`;
          const languagePath = path.join(this.templatesDir, languageFilename);
          
          this.logger.log(`🔍 Buscando template localizado: ${languageFilename} (idioma recibido: '${language}')`);
          
          // Si existe el archivo del idioma específico, usarlo
          if (fs.existsSync(languagePath)) {
            filename = languageFilename;
            this.logger.log(`✅ Usando template en idioma '${normalizedLang}': ${filename}`);
          } else {
            this.logger.warn(
              `⚠️ Template '${languageFilename}' no existe, usando default (español): ${templateName}.html`,
            );
          }
        } else {
          this.logger.log(`📧 Idioma español ('es') detectado, usando template base: ${templateName}.html`);
        }
      } else {
        this.logger.log(`📧 Sin idioma especificado, usando default: ${templateName}.html`);
      }
      
      const templatePath = path.join(this.templatesDir, filename);
      this.logger.debug(`Cargando template desde: ${templatePath}`);
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const template = Handlebars.compile(templateContent);
      return template(variables);
    } catch (error) {
      this.logger.error(
        `Error cargando/compilando template ${templateName}:`,
        error,
      );
      throw new Error(`No se pudo cargar la plantilla: ${templateName}`);
    }
  }

  /**
   * Envía email de notificación al admin cuando se recibe un nuevo lead
   */
  async sendLeadNotificationToAdmin(
    lead: any,
    tenantId: number,
  ): Promise<void> {
    try {
      this.logger.log(`📧 Preparando notificación para admin - Lead ID: ${lead.id}, Idioma: ${lead.language || 'undefined'}`);

      // Obtener información del tenant
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, config: true },
      });

      if (!tenant) {
        this.logger.warn(`Tenant ${tenantId} no encontrado`);
        return;
      }

      // Obtener email del admin (TenantUser con rol admin/owner)
      const adminUser = await this.prisma.tenantUser.findFirst({
        where: {
          tenantId,
          role: { in: ['admin', 'owner'] },
        },
        select: { email: true },
      });

      if (!adminUser) {
        this.logger.warn(`Admin usuario no encontrado para tenant ${tenantId}`);
        return;
      }

      const config = tenant.config as any;

      // Preparar variables para la plantilla
      const templateVariables = {
        tenantName: tenant.name,
        tenantLogo: config?.logo,
        brandColor: config?.brandColor || '#667eea',
        brandColorDark: config?.brandColorDark || '#764ba2',
        leadId: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        businessName: lead.businessName,
        whatsappNumber: lead.whatsappNumber,
        website: lead.website,
        service: lead.service,
        currentSetup: lead.currentSetup,
        budgetRange: lead.budgetRange,
        mostImportantRightNow: lead.mostImportantRightNow,
        commitment2To3Months: lead.commitment2To3Months,
        biggestPainPoint: lead.biggestPainPoint,
        salesFollowUpPerson: lead.salesFollowUpPerson,
        status: lead.status,
        createdAt: new Date(lead.createdAt).toLocaleString('es-ES'),
        dashboardLink: `${config?.website || 'https://www.barmentech.com'}/admin/leads/${lead.id}`,
        // Footer info para CAN-SPAM compliance
        street: config?.street,
        city: config?.city,
        state: config?.state,
        zipCode: config?.zipCode,
        country: config?.country,
        phone: config?.phone,
        ein: config?.ein,
        supportEmail: config?.supportEmail,
      };

      // Compilar plantilla
      const htmlContent = this.loadAndCompileTemplate(
        'lead-notification-admin',
        templateVariables,
        lead.language,
      );

      // Enviar email via SendGrid
      const subjectPrefix = lead.language === 'en' 
        ? '🎯 New Lead!'
        : '🎯 ¡Nuevo Lead!';
        
      const msg = {
        to: adminUser.email,
        from: {
          email: config?.email?.fromAddress || process.env.SENDGRID_FROM_EMAIL,
          name: config?.email?.fromName || process.env.SENDGRID_FROM_NAME,
        },
        replyTo: config?.email?.replyToAddress || process.env.SENDGRID_REPLY_TO,
        subject: `${subjectPrefix} - ${lead.businessName}`,
        html: htmlContent,
      };

      await this.sgMail.send(msg);
      this.logger.log(`✅ Email de notificación enviado al admin: ${adminUser.email} (desde: ${msg.from.name})`);
    } catch (error) {
      this.logger.error(
        `Error enviando email de notificación al admin:`,
        error,
      );
      // No lanzamos error para no bloquear la creación del lead
    }
  }

  /**
   * Envía email de confirmación al cliente que envió el formulario
   */
  async sendLeadConfirmationToClient(
    lead: any,
    tenantId: number,
  ): Promise<void> {
    try {
      this.logger.log(`📧 Preparando confirmación para cliente - Lead ID: ${lead.id}, Idioma: ${lead.language || 'undefined'}`);

      // Obtener información del tenant
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, config: true },
      });

      if (!tenant) {
        this.logger.warn(`Tenant ${tenantId} no encontrado`);
        return;
      }

      const config = tenant.config as any;

      // Preparar variables para la plantilla
      const templateVariables = {
        tenantName: tenant.name,
        tenantLogo: config?.logo,
        brandColor: config?.brandColor || '#667eea',
        brandColorDark: config?.brandColorDark || '#764ba2',
        fullName: lead.fullName.split(' ')[0], // Solo primer nombre
        email: lead.email,
        businessName: lead.businessName,
        service: lead.service,
        budgetRange: lead.budgetRange,
        whatsappNumber: lead.whatsappNumber,
        supportEmail: config?.supportEmail,
        // Footer info para CAN-SPAM compliance
        street: config?.street,
        city: config?.city,
        state: config?.state,
        zipCode: config?.zipCode,
        country: config?.country,
        phone: config?.phone,
      };

      // Compilar plantilla
      const htmlContent = this.loadAndCompileTemplate(
        'lead-confirmation-client',
        templateVariables,
        lead.language,
      );

      // Enviar email via SendGrid
      const subject = lead.language === 'en' 
        ? '✓ Confirmation - We received your request'
        : '✓ Confirmación - Recibimos tu solicitud';
        
      const msg = {
        to: lead.email,
        from: {
          email: config?.email?.fromAddress || process.env.SENDGRID_FROM_EMAIL,
          name: config?.email?.fromName || process.env.SENDGRID_FROM_NAME,
        },
        replyTo: config?.email?.replyToAddress || process.env.SENDGRID_REPLY_TO,
        subject,
        html: htmlContent,
      };

      await this.sgMail.send(msg);
      this.logger.log(`✅ Email de confirmación enviado a: ${lead.email} (desde: ${msg.from.name})`);
    } catch (error) {
      this.logger.error(
        `Error enviando email de confirmación al cliente:`,
        error,
      );
      // No lanzamos error para no bloquear la creación del lead
    }
  }

  /**
   * Envía ambos emails (admin + cliente) de forma paralela
   */
  async sendLeadNotifications(lead: any, tenantId: number): Promise<void> {
    try {
      await Promise.all([
        this.sendLeadNotificationToAdmin(lead, tenantId),
        this.sendLeadConfirmationToClient(lead, tenantId),
      ]);
      this.logger.log(`Emails de lead enviados exitosamente para: ${lead.id}`);
    } catch (error) {
      this.logger.error(`Error enviando emails para lead ${lead.id}:`, error);
    }
  }
}
