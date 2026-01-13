import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { UpdateMediaDto } from './dto/update-media.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Media Controller
 * Endpoints para gestión de imágenes - Requiere autenticación
 * Solo admins/owners del tenant pueden gestionar media
 */
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Obtener logo del tenant (PÚBLICO - sin autenticación)
   * GET /media/logo/:tenantId
   */
  @Get('logo/:tenantId')
  async getTenantLogo(@Param('tenantId') tenantId: string) {
    return this.mediaService.getTenantLogo(parseInt(tenantId, 10));
  }

  /**
   * Upload de imagen
   * POST /admin/media/upload
   * Body: file (multipart/form-data)
   * Query: entityType, entityId, alt
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Post('admin/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('alt') alt?: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    if (!entityType) {
      throw new BadRequestException('Entity type is required');
    }

    return this.mediaService.uploadMedia(
      file,
      tenantId,
      entityType,
      entityId || '',
      alt,
    );
  }

  /**
   * Listar todas las imágenes del tenant del usuario
   * GET /admin/media
   * Requiere: Autenticado
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager', 'staff')
  async findByTenant(@CurrentTenant() tenantId?: number) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.mediaService.findByTenant(tenantId);
  }

  /**
   * Listar imágenes de una entidad específica
   * GET /admin/media/entity?entityType=category&entityId=cat-123
   * Requiere: Autenticado
   */
  @Get('admin/entity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager', 'staff')
  async findByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.mediaService.findByEntity(tenantId, entityType, entityId);
  }

  /**
   * Obtener una imagen por ID
   * GET /admin/media/:id
   * Requiere: Autenticado
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager', 'staff')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.mediaService.findOne(id, tenantId);
  }

  /**
   * Actualizar metadata de imagen (alt, order, etc)
   * PATCH /admin/media/:id
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.mediaService.update(id, tenantId, updateMediaDto);
  }

  /**
   * Eliminar imagen
   * DELETE /admin/media/:id
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.mediaService.remove(id, tenantId);
  }
}
