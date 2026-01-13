import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, createPaymentDto: CreatePaymentDto) {
    const { orderId, amount, currency, provider, providerPaymentId, idempotencyKey } = createPaymentDto;

    // Verificar idempotency
    const existingPayment = await this.prisma.payment.findUnique({
      where: {
        tenantId_idempotencyKey: {
          tenantId,
          idempotencyKey,
        },
      },
    });

    if (existingPayment) {
      // Retornar el pago existente si ya fue procesado
      return existingPayment;
    }

    // Verificar que la orden existe y pertenece al tenant
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verificar que el monto no exceda el total de la orden
    if (amount > order.totalAmount) {
      throw new BadRequestException('Payment amount exceeds order total');
    }

    // Crear el pago
    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        orderId,
        status: 'pending',
        amount,
        currency: currency || order.currency,
        provider,
        providerPaymentId,
        idempotencyKey,
      },
      include: {
        order: true,
      },
    });

    // TODO: Integrar con provider de pago (Stripe, PayPal, etc.)
    // Aquí iría la lógica para procesar el pago con el proveedor

    return payment;
  }

  async findAllByTenant(tenantId: number) {
    return this.prisma.payment.findMany({
      where: { tenantId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByOrder(orderId: string, tenantId: number) {
    return this.prisma.payment.findMany({
      where: { orderId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: number) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async update(id: string, tenantId: number, updatePaymentDto: UpdatePaymentDto) {
    await this.findOne(id, tenantId);

    return this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
      include: {
        order: true,
      },
    });
  }

  async markAsPaid(id: string, tenantId: number, providerPaymentId?: string) {
    // ACID: Usar transacción para actualizar pago y orden atómicamente
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { id, tenantId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Actualizar el pago a pagado
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: 'paid',
          providerPaymentId: providerPaymentId || payment.providerPaymentId,
        },
      });

      // Verificar si todos los pagos de la orden suman el total
      const orderPayments = await tx.payment.findMany({
        where: {
          orderId: payment.orderId,
          status: 'paid',
        },
      });

      const totalPaid = orderPayments.reduce((sum, p) => sum + p.amount, 0);
      const order = await tx.order.findUnique({
        where: { id: payment.orderId },
      });

      // Si el total pagado cubre la orden, marcar la orden como pagada
      if (totalPaid >= order.totalAmount) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'paid' },
        });
      }

      return updatedPayment;
    });
  }

  async markAsFailed(id: string, tenantId: number) {
    await this.findOne(id, tenantId);

    return this.prisma.payment.update({
      where: { id },
      data: { status: 'failed' },
    });
  }
}
