/**
 * CRM Controller
 * Endpoints REST para conversaciones, mensajes y webhooks
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ChannelType, TenantUserRole } from '@prisma/client';

@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // ========================================
  // CONVERSACIONES
  // ========================================

  /**
   * GET /crm/conversations
   * Listar conversaciones del tenant
   */
  @Get('conversations')
  @Roles(TenantUserRole.admin, TenantUserRole.owner, TenantUserRole.manager, TenantUserRole.staff)
  async getConversations(
    @CurrentTenant() tenantId: number,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.crmService.getConversationsByTenant(tenantId, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 50,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  /**
   * GET /crm/conversations/:conversationId
   * Obtener detalles de una conversación
   */
  @Get('conversations/:conversationId')
  @Roles(TenantUserRole.admin, TenantUserRole.owner, TenantUserRole.manager, TenantUserRole.staff)
  async getConversation(
    @Param('conversationId') conversationId: string,
    @CurrentTenant() tenantId: number,
  ) {
    return this.crmService.getConversation(conversationId, tenantId);
  }

  /**
   * POST /crm/conversations
   * Crear una nueva conversación (útil para testing o inicio manual)
   */
  @Post('conversations')
  @Roles(TenantUserRole.admin, TenantUserRole.owner, TenantUserRole.manager)
  async createConversation(
    @CurrentTenant() tenantId: number,
    @Body() body: {
      channel: ChannelType;
      channelUserId: string;
      channelUsername?: string;
      customerId?: string;
    },
  ) {
    return this.crmService.findOrCreateConversation({
      tenantId,
      ...body,
    });
  }

  /**
   * PUT /crm/conversations/:conversationId
   * Actualizar conversación (marcar como inactiva, vincular customer, etc)
   */
  @Post('conversations/:conversationId')
  @Roles(TenantUserRole.admin, TenantUserRole.owner, TenantUserRole.manager)
  async updateConversation(
    @Param('conversationId') conversationId: string,
    @CurrentTenant() tenantId: number,
    @Body() body: {
      customerId?: string | null;
      isActive?: boolean;
    },
  ) {
    return this.crmService.updateConversation(conversationId, tenantId, body);
  }

  // ========================================
  // MENSAJES
  // ========================================

  /**
   * GET /crm/conversations/:conversationId/messages
   * Listar mensajes de una conversación
   */
  @Get('conversations/:conversationId/messages')
  @Roles(TenantUserRole.admin, TenantUserRole.owner, TenantUserRole.manager, TenantUserRole.staff)
  async getMessages(
    @Param('conversationId') conversationId: string,
    @CurrentTenant() tenantId: number,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.crmService.getMessages(conversationId, tenantId, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 100,
    });
  }

  /**
   * POST /crm/conversations/:conversationId/messages
   * Enviar un mensaje saliente
   */
  @Post('conversations/:conversationId/messages')
  @Roles(TenantUserRole.admin, TenantUserRole.owner, TenantUserRole.manager, TenantUserRole.staff)
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @CurrentTenant() tenantId: number,
    @Body() body: {
      content: string;
      mediaUrl?: string;
    },
  ) {
    if (!body.content || body.content.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    return this.crmService.sendMessage({
      tenantId,
      conversationId,
      content: body.content,
      mediaUrl: body.mediaUrl,
    });
  }

  /**
   * POST /crm/channels/:channel/validate
   * Validar credenciales de un canal
   */
  @Post('channels/:channel/validate')
  @Roles(TenantUserRole.admin, TenantUserRole.owner)
  async validateChannel(
    @Param('channel') channel: string,
    @CurrentTenant() tenantId: number,
    @Body() credentials: any,
  ) {
    const validChannels = Object.values(ChannelType);
    if (!validChannels.includes(channel as ChannelType)) {
      throw new BadRequestException(`Invalid channel: ${channel}`);
    }

    return this.crmService.validateChannelCredentials(tenantId, channel as ChannelType, credentials);
  }

  /**
   * GET /crm/channels/:channel/health
   * Verificar salud de un canal
   */
  @Get('channels/:channel/health')
  @Roles(TenantUserRole.admin, TenantUserRole.owner)
  async healthCheck(
    @Param('channel') channel: string,
    @CurrentTenant() tenantId: number,
  ) {
    const validChannels = Object.values(ChannelType);
    if (!validChannels.includes(channel as ChannelType)) {
      throw new BadRequestException(`Invalid channel: ${channel}`);
    }

    const isHealthy = await this.crmService.healthCheck(channel as ChannelType, tenantId);
    return { channel, isHealthy };
  }

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  /**
   * GET /crm/stats
   * Obtener estadísticas de CRM del tenant
   */
  @Get('stats')
  @Roles(TenantUserRole.admin, TenantUserRole.owner, TenantUserRole.manager)
  async getStats(@CurrentTenant() tenantId: number) {
    return this.crmService.getStats(tenantId);
  }
}
