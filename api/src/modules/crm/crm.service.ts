/**
 * CRM Service
 * Lógica central para gestionar conversaciones, mensajes y ruteo a drivers
 */

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChannelDriverFactory } from './factory/channel-driver.factory';
import { ChannelType, Prisma } from '@prisma/client';
import { IChannelDriver, ChannelWebhookPayload } from './drivers/channel.driver';

export interface CreateConversationDto {
  tenantId: number;
  channel: ChannelType;
  channelUserId: string;
  channelUsername?: string;
  customerId?: string;
}

export interface SendMessageDto {
  tenantId: number;
  conversationId: string;
  content: string;
  mediaUrl?: string;
}

export interface ReceiveMessageDto {
  tenantId: number;
  channel: ChannelType;
  payload: any; // Payload específico del proveedor
}

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);
  private drivers: Map<string, IChannelDriver> = new Map();

  constructor(
    private prisma: PrismaService,
    private driverFactory: ChannelDriverFactory,
  ) {}

  // ========================================
  // CONVERSACIONES
  // ========================================

  /**
   * Crear o obtener una conversación existente
   */
  async findOrCreateConversation(dto: CreateConversationDto) {
    const { tenantId, channel, channelUserId, channelUsername, customerId } = dto;

    try {
      let conversation = await this.prisma.conversation.findUnique({
        where: {
          tenantId_channel_channelUserId: {
            tenantId,
            channel,
            channelUserId,
          },
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            tenantId,
            channel,
            channelUserId,
            channelUsername: channelUsername || channelUserId,
            customerId,
            isActive: true,
            lastMessageAt: new Date(),
          },
        });

        this.logger.log(
          `Created new conversation ${conversation.id} for channel ${channel} user ${channelUserId}`,
        );
      }

      return conversation;
    } catch (error) {
      this.logger.error('Error creating/finding conversation', error);
      throw error;
    }
  }

  /**
   * Listar conversaciones activas de un tenant
   */
  async getConversationsByTenant(
    tenantId: number,
    options?: { skip?: number; take?: number; isActive?: boolean },
  ) {
    try {
      const where: Prisma.ConversationWhereInput = { tenantId };
      if (options?.isActive !== undefined) {
        where.isActive = options.isActive;
      }

      const conversations = await this.prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        skip: options?.skip,
        take: options?.take,
        include: {
          _count: {
            select: { messages: true },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return conversations;
    } catch (error) {
      this.logger.error('Error fetching conversations', error);
      throw error;
    }
  }

  /**
   * Obtener detalles de una conversación
   */
  async getConversation(conversationId: string, tenantId: number) {
    try {
      const conversation = await this.prisma.conversation.findFirst({
        where: { id: conversationId, tenantId },
        include: {
          customer: true,
          _count: {
            select: { messages: true },
          },
        },
      });

      if (!conversation) {
        throw new NotFoundException(`Conversation ${conversationId} not found`);
      }

      return conversation;
    } catch (error) {
      this.logger.error(`Error fetching conversation ${conversationId}`, error);
      throw error;
    }
  }

  /**
   * Actualizar estado de conversación
   */
  async updateConversation(
    conversationId: string,
    tenantId: number,
    data: Partial<{
      customerId: string | null;
      isActive: boolean;
    }>,
  ) {
    try {
      const conversation = await this.prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return conversation;
    } catch (error) {
      this.logger.error(`Error updating conversation ${conversationId}`, error);
      throw error;
    }
  }

  // ========================================
  // MENSAJES
  // ========================================

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(
    conversationId: string,
    tenantId: number,
    options?: { skip?: number; take?: number },
  ) {
    try {
      const messages = await this.prisma.message.findMany({
        where: { conversationId, tenantId },
        orderBy: { createdAt: 'asc' },
        skip: options?.skip,
        take: options?.take,
      });

      return messages;
    } catch (error) {
      this.logger.error(`Error fetching messages for conversation ${conversationId}`, error);
      throw error;
    }
  }

  /**
   * Enviar mensaje saliente a través del canal
   */
  async sendMessage(dto: SendMessageDto) {
    const { tenantId, conversationId, content, mediaUrl } = dto;

    try {
      // 1. Obtener conversación
      const conversation = await this.getConversation(conversationId, tenantId);

      // 2. Obtener driver para el canal
      const driver = this.getDriver(conversation.channel, tenantId);

      // 3. Enviar a través del proveedor
      const sendResult = await driver.sendMessage({
        channelUserId: conversation.channelUserId,
        message: {
          content,
          mediaUrl,
        },
        conversationMetadata: conversation.metadata as any,
      });

      if (!sendResult.success) {
        throw new BadRequestException(`Failed to send message: ${sendResult.error}`);
      }

      // 4. Guardar en BD
      const message = await this.prisma.message.create({
        data: {
          tenantId,
          conversationId,
          direction: 'outbound',
          content,
          mediaUrl,
          channel: conversation.channel,
          status: sendResult.status,
          externalId: sendResult.externalId,
        },
      });

      // 5. Actualizar lastMessageAt de la conversación
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      this.logger.log(`Message sent: ${message.id} via ${conversation.channel}`);
      return message;
    } catch (error) {
      this.logger.error(`Error sending message`, error);
      throw error;
    }
  }

  /**
   * Procesar webhook de un proveedor de canal
   * Crear/actualizar conversación y guardar mensaje entrante
   */
  async handleWebhook(dto: ReceiveMessageDto) {
    const { tenantId, channel, payload } = dto;

    try {
      // 1. Obtener driver
      const driver = this.getDriver(channel, tenantId);

      // 2. Procesar webhook con el driver
      const webhookPayload = driver.handleWebhook(payload);
      if (!webhookPayload) {
        this.logger.warn(`Invalid webhook payload for ${channel}`);
        return null;
      }

      // 3. Crear o obtener conversación
      const conversation = await this.findOrCreateConversation({
        tenantId,
        channel,
        channelUserId: webhookPayload.channelUserId,
        channelUsername: webhookPayload.channelUsername,
      });

      // 4. Guardar mensaje entrante
      const message = await this.prisma.message.create({
        data: {
          tenantId,
          conversationId: conversation.id,
          direction: 'inbound',
          content: webhookPayload.content,
          mediaUrl: webhookPayload.mediaUrl,
          channel,
          status: 'delivered', // Asumimos que se entregó correctamente si llegó el webhook
          externalId: webhookPayload.externalId,
          metadata: webhookPayload.metadata,
        },
      });

      // 5. Actualizar lastMessageAt de la conversación
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });

      this.logger.log(`Webhook processed: message ${message.id} saved from ${channel}`);
      return message;
    } catch (error) {
      this.logger.error(`Error processing webhook`, error);
      throw error;
    }
  }

  // ========================================
  // DRIVERS
  // ========================================

  /**
   * Obtener driver para un canal (lazy load + cache)
   */
  private getDriver(channel: ChannelType, tenantId: number): IChannelDriver {
    const key = `${tenantId}:${channel}`;

    if (!this.drivers.has(key)) {
      // TODO: Obtener credenciales del tenant desde config o BD
      const credentials = {}; // Por ahora vacío, en producción obtener de tenant.config

      const driver = this.driverFactory.createDriver(channel, credentials);
      this.drivers.set(key, driver);
    }

    return this.drivers.get(key)!;
  }

  /**
   * Validar credenciales de un canal para un tenant
   */
  async validateChannelCredentials(
    tenantId: number,
    channel: ChannelType,
    credentials: any,
  ) {
    try {
      const driver = this.driverFactory.createDriver(channel, credentials);
      const result = await driver.validateCredentials(credentials);
      return result;
    } catch (error) {
      this.logger.error(`Error validating credentials for ${channel}`, error);
      throw error;
    }
  }

  /**
   * Verificar health de un canal
   */
  async healthCheck(channel: ChannelType, tenantId: number) {
    try {
      const driver = this.getDriver(channel, tenantId);
      const isHealthy = await driver.healthCheck();
      return isHealthy;
    } catch (error) {
      this.logger.error(`Health check failed for ${channel}`, error);
      return false;
    }
  }

  /**
   * Recibir un mensaje entrante y guardarlo en la BD
   */
  async receiveMessage(data: {
    tenantId: number;
    conversationId: string;
    direction: any;
    content: string;
    channel: ChannelType;
    mediaUrl?: string;
    externalId?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const message = await this.prisma.message.create({
        data: {
          tenantId: data.tenantId,
          conversationId: data.conversationId,
          direction: data.direction,
          content: data.content,
          channel: data.channel,
          status: 'delivered',
          mediaUrl: data.mediaUrl,
          externalId: data.externalId,
          metadata: data.metadata,
        },
      });

      // Actualizar lastMessageAt en conversación
      await this.prisma.conversation.update({
        where: { id: data.conversationId },
        data: { lastMessageAt: new Date() },
      });

      this.logger.log(`Received message ${message.id} on conversation ${data.conversationId}`);
      return message;
    } catch (error) {
      this.logger.error('Error receiving message', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de CRM del tenant
   */
  async getStats(tenantId: number) {
    const [totalConversations, activeConversations, totalMessages, messagesByChannel] = 
      await Promise.all([
        this.prisma.conversation.count({
          where: { tenantId },
        }),
        this.prisma.conversation.count({
          where: { tenantId, isActive: true },
        }),
        this.prisma.message.count({
          where: { tenantId },
        }),
        this.prisma.message.groupBy({
          by: ['channel'],
          where: { tenantId },
          _count: true,
        }),
      ]);

    const channelStats = messagesByChannel.map(stat => ({
      channel: stat.channel,
      count: stat._count,
    }));

    return {
      totalConversations,
      activeConversations,
      inactiveConversations: totalConversations - activeConversations,
      totalMessages,
      channelStats,
    };
  }
}
