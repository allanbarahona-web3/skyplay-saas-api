import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Crear pago
   * POST /payments
   * Requiere: Autenticado
   */
  @Post()
  @Roles('owner', 'manager', 'staff', 'customer', 'admin')
  @Throttle({ default: { limit: 25, ttl: 60000 } })
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.paymentsService.create(tenantId, createPaymentDto);
  }

  /**
   * Listar todos los pagos del tenant
   * GET /payments
   * Requiere: Autenticado
   */
  @Get()
  @Roles('owner', 'manager', 'staff', 'customer', 'admin')
  @SkipThrottle()
  findAll(@CurrentTenant() tenantId?: number) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.paymentsService.findAllByTenant(tenantId);
  }

  /**
   * Obtener pagos por pedido
   * GET /payments/order/:orderId
   * Requiere: Autenticado
   */
  @Get('order/:orderId')
  @Roles('owner', 'manager', 'staff', 'customer', 'admin')
  @SkipThrottle()
  findByOrder(
    @Param('orderId') orderId: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.paymentsService.findAllByOrder(orderId, tenantId);
  }

  /**
   * Obtener pago por ID
   * GET /payments/:id
   * Requiere: Autenticado
   */
  @Get(':id')
  @Roles('owner', 'manager', 'staff', 'customer', 'admin')
  @SkipThrottle()
  findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.paymentsService.findOne(id, tenantId);
  }

  /**
   * Actualizar pago
   * PATCH /payments/:id
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Patch(':id')
  @Roles('owner', 'manager', 'admin')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.paymentsService.update(id, tenantId, updatePaymentDto);
  }

  /**
   * Marcar pago como pagado
   * PATCH /payments/:id/mark-paid
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Patch(':id/mark-paid')
  @Roles('owner', 'manager', 'admin')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  markAsPaid(
    @Param('id') id: string,
    @Body('providerPaymentId') providerPaymentId?: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.paymentsService.markAsPaid(id, tenantId, providerPaymentId);
  }

  /**
   * Marcar pago como fallido
   * PATCH /payments/:id/mark-failed
   * Requiere: Autenticado y ser owner/manager del tenant
   */
  @Patch(':id/mark-failed')
  @Roles('owner', 'manager', 'admin')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  markAsFailed(
    @Param('id') id: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.paymentsService.markAsFailed(id, tenantId);
  }
}
