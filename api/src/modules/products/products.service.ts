import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, createProductDto: CreateProductDto) {
    // Verificar si el slug ya existe en este tenant
    const existing = await this.prisma.product.findUnique({
      where: {
        tenantId_slug: {
          tenantId,
          slug: createProductDto.slug,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Product slug already exists in this tenant');
    }

    return this.prisma.product.create({
      data: {
        tenantId,
        ...createProductDto,
      },
    });
  }

  async findAllByTenant(tenantId: number) {
    return this.prisma.product.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string, tenantId: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        tenantId_slug: {
          tenantId,
          slug,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async update(id: string, tenantId: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id, tenantId);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async deactivate(id: string, tenantId: number) {
    await this.findOne(id, tenantId);

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async remove(id: string, tenantId: number) {
    await this.findOne(id, tenantId);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
