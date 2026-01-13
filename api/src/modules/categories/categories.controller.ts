import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

/**
 * Categories Controller
 * Endpoints para gestión de categorías de productos
 * Requiere autenticación JWT
 */
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Crear categoría
   * POST /admin/categories
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Post()
  @Roles('owner', 'manager', 'admin')
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.categoriesService.create({
      ...createCategoryDto,
      tenantId,
    });
  }

  /**
   * Listar todas las categorías de un tenant
   * GET /admin/categories
   * Requiere: Autenticado
   */
  @Get()
  @Roles('owner', 'manager', 'staff', 'admin')
  async findByTenant(@CurrentTenant() tenantId?: number) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.categoriesService.findByTenant(tenantId);
  }

  /**
   * Listar solo categorías activas (para storefront)
   * GET /admin/categories/active
   * Requiere: Autenticado
   */
  @Get('active')
  @Roles('owner', 'manager', 'staff', 'admin')
  async findActiveCategoriesByTenant(@CurrentTenant() tenantId?: number) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.categoriesService.findActiveCategoriesByTenant(tenantId);
  }

  /**
   * Obtener una categoría por ID
   * GET /admin/categories/:id
   * Requiere: Autenticado
   */
  @Get(':id')
  @Roles('owner', 'manager', 'staff', 'admin')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.categoriesService.findOne(id, tenantId);
  }

  /**
   * Actualizar categoría
   * PATCH /admin/categories/:id
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Patch(':id')
  @Roles('owner', 'manager', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.categoriesService.update(id, tenantId, updateCategoryDto);
  }

  /**
   * Eliminar categoría
   * DELETE /admin/categories/:id
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Delete(':id')
  @Roles('owner', 'manager', 'admin')
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.categoriesService.remove(id, tenantId);
  }
}
