/**
 * DTO para configuración de tenant (incluyendo SMTP)
 * Se almacena en tenants.config como JSON
 */

export class SmtpConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'aws-ses' = 'smtp';
  
  // Para SMTP
  host?: string;
  port?: number;
  secure?: boolean; // true = 465, false = 587
  auth?: {
    user: string;
    pass: string; // Se encriptará antes de guardar
  };
  
  // Para SendGrid/Mailgun/AWS-SES
  apiKey?: string; // Se encriptará antes de guardar
  
  // Campos comunes
  fromAddress: string;
  fromName: string;
  replyToAddress?: string;
  isActive: boolean = true;
}

export class TenantConfigDto {
  // Email/SMTP configuration
  email?: SmtpConfig;
  
  // Otros configs
  timezone?: string;
  currency?: string;
  language?: string;
  
  // Configuración de tienda
  storeName?: string;
  storeDescription?: string;
  logoUrl?: string;
  
  // Políticas
  returnsPolicy?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  
  // Integraciones
  stripeApiKey?: string; // Encriptado
  paypalClientId?: string; // Encriptado
  
  // Otro
  [key: string]: any;
}

/**
 * Tipos para el campo config JSON en Tenant
 */
export type TenantConfig = TenantConfigDto;
