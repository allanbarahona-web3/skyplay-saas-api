import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear una categoría
   */
  async create(createCategoryDto: CreateCategoryDto & { tenantId: number }) {
    return this.prisma.category.create({
      data: {
        tenantId: createCategoryDto.tenantId,
        name: createCategoryDto.name,
        slug: createCategoryDto.slug,
        description: createCategoryDto.description,
        isActive: createCategoryDto.isActive ?? true,
      },
    });
  }

  /**
   * Listar todas las categorías de un tenant
   */
  async findByTenant(tenantId: number) {
    return this.prisma.category.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Listar solo categorías activas
   */
  async findActiveCategoriesByTenant(tenantId: number) {
    return this.prisma.category.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Obtener una categoría por ID
   */
  async findOne(id: string, tenantId: number) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
      include: {
        products: {
          where: { isActive: true },
          take: 10,
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Actualizar una categoría
   */
  async update(id: string, tenantId: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id, tenantId); // Verificar que existe

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  /**
   * Eliminar una categoría
   */
  async remove(id: string, tenantId: number) {
    await this.findOne(id, tenantId);

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
}
