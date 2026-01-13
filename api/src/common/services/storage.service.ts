import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Storage Service
 * Servicio genérico para construir URLs y paths de imágenes
 * Funciona tanto con DO Spaces directo como con CDN de Cloudflare
 */
@Injectable()
export class StorageService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Construye la URL completa de la imagen según ambiente
   * En desarrollo: DO Spaces directo
   * En producción: A través de Cloudflare CDN
   */
  getImageUrl(path: string): string {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    
    if (nodeEnv === 'production') {
      const cdnUrl = this.configService.get<string>('CDN_URL');
      return `${cdnUrl}/${path}`;
    }
    
    // Desarrollo: usar DO Spaces directo
    const doSpacesUrl = this.configService.get<string>('DO_SPACES_URL');
    return `${doSpacesUrl}/${path}`;
  }

  /**
   * Genera el path relativo para guardar en BD
   * Formato: {tenantName}/{entityType}/{filename}
   */
  async generateMediaPath(
    tenantId: number,
    entityType: string,
    fileName: string,
  ): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });
    
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Usar el nombre del tenant como carpeta (ej: BarmentechSaaS, Tactika-X)
    return `${tenant.name}/${entityType}/${fileName}`;
  }

  /**
   * Genera el S3 key (mismo que path relativo)
   * Este es el path que se usa en DO Spaces
   */
  async generateS3Key(
    tenantId: number,
    entityType: string,
    fileName: string,
  ): Promise<string> {
    return this.generateMediaPath(tenantId, entityType, fileName);
  }

  /**
   * Genera un nombre de archivo único
   */
  generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(`.${extension}`, '');
    const sanitizedName = nameWithoutExt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    return `${timestamp}-${random}-${sanitizedName}.${extension}`;
  }
}
