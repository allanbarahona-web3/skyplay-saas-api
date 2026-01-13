import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, createOrderDto: CreateOrderDto) {
    const { customerId, items, currency } = createOrderDto;

    // Validar que haya items
    if (!items || items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    // ACID: Usar transacción para garantizar atomicidad
    return this.prisma.$transaction(async (tx) => {
      // Obtener productos y calcular totales
      const productIds = items.map(item => item.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          tenantId,
        },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products not found');
      }

      // Calcular totales (lógica simplificada)
      let subtotalAmount = 0;
      const orderItems = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        const unitPrice = Number(product.price);
        const totalPrice = unitPrice * item.quantity;
        subtotalAmount += totalPrice;

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        };
      });

      // Generar orderNumber único dentro de la transacción
      const orderNumber = await this.generateOrderNumberInTx(tx, tenantId);

      // Crear orden con items
      return tx.order.create({
        data: {
          tenantId,
          orderNumber,
          customerId,
          status: 'pending',
          subtotalAmount,
          taxAmount: 0, // TODO: Calcular impuestos
          shippingAmount: 0, // TODO: Calcular envío
          discountAmount: 0,
          totalAmount: subtotalAmount,
          currency: currency || 'USD',
          items: {
            create: orderItems.map(item => ({
              tenantId,
              ...item,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async findAllByTenant(tenantId: number) {
    return this.prisma.order.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, tenantId: number, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id, tenantId);

    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        items: true,
      },
    });
  }

  async cancel(id: string, tenantId: number) {
    await this.findOne(id, tenantId);

    return this.prisma.order.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  private async generateOrderNumber(tenantId: number): Promise<string> {
    // Generar número de orden único (formato: ORD-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Contar órdenes del día para este tenant
    const count = await this.prisma.order.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `ORD-${dateStr}-${sequence}`;
  }

  private async generateOrderNumberInTx(tx: any, tenantId: number): Promise<string> {
    // Generar número de orden único dentro de una transacción
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Contar órdenes del día para este tenant
    const count = await tx.order.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `ORD-${dateStr}-${sequence}`;
  }
}
