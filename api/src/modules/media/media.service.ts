import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { DOSpacesService } from '../../common/services/do-spaces.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private doSpacesService: DOSpacesService,
  ) {}

  /**
   * Obtiene el logo del tenant (público, sin autenticación)
   */
  async getTenantLogo(tenantId: number) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { config: true, name: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    const config = tenant.config as any;
    const logoUrl = config?.logo;

    if (!logoUrl) {
      throw new NotFoundException(`No logo found for tenant ${tenantId}`);
    }

    return {
      tenantId,
      tenantName: tenant.name,
      logoUrl,
    };
  }

  /**
   * Sube un archivo y crea el registro en BD
   */
  async uploadMedia(
    file: Express.Multer.File,
    tenantId: number,
    entityType: string,
    entityId: string,
    alt?: string,
  ) {
    // Generar nombre único
    const fileName = this.storageService.generateUniqueFileName(file.originalname);
    
    // Generar path (ahora es async)
    const key = await this.storageService.generateS3Key(tenantId, entityType, fileName);

    // Subir a DO Spaces
    const { path } = await this.doSpacesService.uploadFile(file, key);

    // Guardar en BD
    // Para tenant_branding sin entidad específica, generar un UUID único
    const finalEntityId = entityType === 'tenant_branding' && !entityId ? randomUUID() : entityId;
    
    const media = await this.prisma.media.create({
      data: {
        tenantId,
        entityType,
        entityId: finalEntityId,
        path,
        alt: alt || file.originalname,
        order: 0,
      },
    });

    // Retornar con URL completa
    return {
      ...media,
      url: this.storageService.getImageUrl(media.path),
    };
  }

  /**
   * Obtiene todas las imágenes de un tenant
   */
  async findByTenant(tenantId: number) {
    const mediaList = await this.prisma.media.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return mediaList.map((media) => ({
      ...media,
      url: this.storageService.getImageUrl(media.path),
    }));
  }

  /**
   * Obtiene imágenes de una entidad específica
   */
  async findByEntity(tenantId: number, entityType: string, entityId: string) {
    const mediaList = await this.prisma.media.findMany({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      orderBy: { order: 'asc' },
    });

    return mediaList.map((media) => ({
      ...media,
      url: this.storageService.getImageUrl(media.path),
    }));
  }

  /**
   * Obtiene una imagen por ID
   */
  async findOne(id: string, tenantId: number) {
    const media = await this.prisma.media.findFirst({
      where: { id, tenantId },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return {
      ...media,
      url: this.storageService.getImageUrl(media.path),
    };
  }

  /**
   * Actualiza metadata de una imagen
   */
  async update(id: string, tenantId: number, updateMediaDto: UpdateMediaDto) {
    await this.findOne(id, tenantId); // Verificar que existe

    const media = await this.prisma.media.update({
      where: { id },
      data: updateMediaDto,
    });

    return {
      ...media,
      url: this.storageService.getImageUrl(media.path),
    };
  }

  /**
   * Elimina una imagen (de BD y DO Spaces)
   */
  async remove(id: string, tenantId: number) {
    const media = await this.findOne(id, tenantId);

    // Eliminar de DO Spaces
    await this.doSpacesService.deleteFile(media.path);

    // Eliminar de BD
    await this.prisma.media.delete({
      where: { id },
    });

    return { message: 'Media deleted successfully' };
  }
}
