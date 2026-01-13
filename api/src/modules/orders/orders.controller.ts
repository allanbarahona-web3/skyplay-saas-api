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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Crear pedido
   * POST /orders
   * Requiere: Autenticado (customer puede crear sus propios pedidos)
   */
  @Post()
  @Roles('owner', 'manager', 'staff', 'customer', 'admin')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.ordersService.create(tenantId, createOrderDto);
  }

  /**
   * Listar todos los pedidos del tenant
   * GET /orders
   * Requiere: Autenticado
   */
  @Get()
  @Roles('owner', 'manager', 'staff', 'customer', 'admin')
  @SkipThrottle()
  findAll(@CurrentTenant() tenantId?: number) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.ordersService.findAllByTenant(tenantId);
  }

  /**
   * Obtener pedido por ID
   * GET /orders/:id
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
    return this.ordersService.findOne(id, tenantId);
  }

  /**
   * Actualizar pedido
   * PATCH /orders/:id
   * Requiere: Autenticado y ser owner/manager/staff del tenant
   */
  @Patch(':id')
  @Roles('owner', 'manager', 'staff', 'admin')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.ordersService.update(id, tenantId, updateOrderDto);
  }

  /**
   * Cancelar pedido
   * PATCH /orders/:id/cancel
   * Requiere: Autenticado (staff/customer pueden cancelar)
   */
  @Patch(':id/cancel')
  @Roles('owner', 'manager', 'staff', 'customer', 'admin')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  cancel(
    @Param('id') id: string,
    @CurrentTenant() tenantId?: number,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.ordersService.cancel(id, tenantId);
  }
}
