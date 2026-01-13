import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

/**
 * ============================================================
 * PUBLIC ROUTES (sin autenticación)
 * ============================================================
 */
@Controller('public/products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /api/v1/public/products - Obtener productos públicos de un tenant
   * Sin autenticación - cualquiera puede acceder
   * El tenantId se obtiene del domain/host automáticamente
   */
  @Get()
  @SkipThrottle()
  async getPublicProducts(@CurrentTenant() tenantId: number) {
    if (!tenantId) {
      throw new BadRequestException('Unable to determine tenant from domain');
    }
    const products = await this.productsService.findAllByTenant(tenantId);
    return {
      success: true,
      count: products.length,
      data: products,
    };
  }
}

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Crear producto
   * POST /products
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Post()
  @Roles('owner', 'manager', 'admin')
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.productsService.create(tenantId, createProductDto);
  }

  /**
   * Listar todos los productos del tenant
   * GET /products
   * Requiere: Autenticado
   */
  @Get()
  @Roles('owner', 'manager', 'staff', 'admin')
  @SkipThrottle()
  findAll(@CurrentTenant() tenantId?: number) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.productsService.findAllByTenant(tenantId);
  }

  /**
   * Obtener producto por slug
   * GET /products/slug/:slug
   * Requiere: Autenticado
   */
  @Get('slug/:slug')
  @Roles('owner', 'manager', 'staff', 'admin')
  @SkipThrottle()
  findBySlug(
    @Param('slug') slug: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.productsService.findBySlug(slug, tenantId);
  }

  /**
   * Obtener producto por ID
   * GET /products/:id
   * Requiere: Autenticado
   */
  @Get(':id')
  @Roles('owner', 'manager', 'staff', 'admin')
  @SkipThrottle()
  findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.productsService.findOne(id, tenantId);
  }

  /**
   * Actualizar producto
   * PATCH /products/:id
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Patch(':id')
  @Roles('owner', 'manager', 'admin')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.productsService.update(id, tenantId, updateProductDto);
  }

  /**
   * Desactivar producto
   * PATCH /products/:id/deactivate
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Patch(':id/deactivate')
  @Roles('owner', 'manager', 'admin')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  deactivate(
    @Param('id') id: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.productsService.deactivate(id, tenantId);
  }

  /**
   * Eliminar producto
   * DELETE /products/:id
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Delete(':id')
  @Roles('owner', 'manager', 'admin')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.productsService.remove(id, tenantId);
  }
}
