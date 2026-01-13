/**
 * CRM Test Controller
 * Endpoints para testing del CRM sin necesidad de proveedores reales
 * Solo disponible en desarrollo
 */

import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ChannelType, MessageDirection } from '@prisma/client';
import { CrmService } from './crm.service';

@Controller('crm-test')
export class CrmTestController {
  private readonly logger = new Logger(CrmTestController.name);

  constructor(private readonly crmService: CrmService) {}

  /**
   * POST /crm-test/create-conversation
   * Crear una conversación de prueba
   */
  @Post('create-conversation')
  async createTestConversation(
    @Body()
    body: {
      tenantId: number;
      channel: ChannelType;
      channelUserId: string;
      channelUsername?: string;
    },
  ) {
    this.logger.log(`Creating test conversation for tenant ${body.tenantId}`);

    try {
      const conversation = await this.crmService.findOrCreateConversation({
        tenantId: body.tenantId,
        channel: body.channel,
        channelUserId: body.channelUserId,
        channelUsername: body.channelUsername,
      });

      return {
        success: true,
        conversation,
      };
    } catch (error) {
      this.logger.error('Error creating test conversation', error);
      throw new BadRequestException('Failed to create test conversation');
    }
  }

  /**
   * POST /crm-test/send-message
   * Enviar un mensaje de prueba
   */
  @Post('send-message')
  async sendTestMessage(
    @Body()
    body: {
      tenantId: number;
      conversationId: string;
      content: string;
      mediaUrl?: string;
    },
  ) {
    this.logger.log(
      `Sending test message to conversation ${body.conversationId} for tenant ${body.tenantId}`,
    );

    try {
      const message = await this.crmService.sendMessage({
        tenantId: body.tenantId,
        conversationId: body.conversationId,
        content: body.content,
        mediaUrl: body.mediaUrl,
      });

      return {
        success: true,
        message,
      };
    } catch (error) {
      this.logger.error('Error sending test message', error);
      throw new BadRequestException('Failed to send test message');
    }
  }

  /**
   * POST /crm-test/simulate-incoming-message
   * Simular un mensaje entrante de un cliente (como si viniera de Meta/WhatsApp)
   */
  @Post('simulate-incoming-message')
  async simulateIncomingMessage(
    @Body()
    body: {
      tenantId: number;
      channel: ChannelType;
      channelUserId: string;
      channelUsername?: string;
      content: string;
      mediaUrl?: string;
    },
  ) {
    this.logger.log(
      `Simulating incoming message from ${body.channelUserId} on ${body.channel} for tenant ${body.tenantId}`,
    );

    try {
      // 1. Buscar o crear conversación
      const conversation = await this.crmService.findOrCreateConversation({
        tenantId: body.tenantId,
        channel: body.channel,
        channelUserId: body.channelUserId,
        channelUsername: body.channelUsername,
      });

      // 2. Crear mensaje entrante
      const incomingMessage = await this.crmService.receiveMessage({
        tenantId: body.tenantId,
        conversationId: conversation.id,
        direction: MessageDirection.inbound,
        content: body.content,
        mediaUrl: body.mediaUrl,
        channel: body.channel,
        externalId: `test_${Date.now()}`,
      });

      return {
        success: true,
        conversation,
        incomingMessage,
      };
    } catch (error) {
      this.logger.error('Error simulating incoming message', error);
      throw new BadRequestException('Failed to simulate incoming message');
    }
  }

  /**
   * POST /crm-test/webhook-meta
   * Simular un webhook de Meta (Instagram/WhatsApp)
   */
  @Post('webhook-meta')
  async testMetaWebhook(
    @Body()
    body: {
      tenantId: number;
      channel: 'whatsapp' | 'instagram';
      senderId: string;
      senderName?: string;
      messageText: string;
      mediaUrl?: string;
    },
  ) {
    this.logger.log(`Testing Meta webhook for ${body.channel} on tenant ${body.tenantId}`);

    if (!['whatsapp', 'instagram'].includes(body.channel)) {
      throw new BadRequestException('Channel must be whatsapp or instagram');
    }

    try {
      // Simular payload de Meta
      const metaPayload =
        body.channel === 'whatsapp'
          ? {
              // Formato Twilio para WhatsApp
              From: `whatsapp:+${body.senderId}`,
              Body: body.messageText,
              MediaUrl0: body.mediaUrl,
              AccountSid: 'test_account',
              MessageSid: `msg_${Date.now()}`,
            }
          : {
              // Formato Meta Graph API para Instagram
              entry: [
                {
                  messaging: [
                    {
                      sender: { id: body.senderId, username: body.senderName },
                      message: {
                        mid: `msg_${Date.now()}`,
                        text: body.messageText,
                        attachments: body.mediaUrl ? [{ payload: { url: body.mediaUrl } }] : [],
                      },
                      timestamp: Date.now(),
                    },
                  ],
                },
              ],
            };

      // Procesar como si fuera un webhook real
      const result = await this.crmService.handleWebhook({
        tenantId: body.tenantId,
        channel: body.channel as ChannelType,
        payload: metaPayload,
      });

      return {
        success: true,
        result,
        simulatedPayload: metaPayload,
      };
    } catch (error) {
      this.logger.error('Error testing Meta webhook', error);
      throw new BadRequestException('Failed to test Meta webhook');
    }
  }

  /**
   * GET /crm-test/health
   * Health check para verificar que el CRM está funcionando
   */
  @Post('health')
  async healthCheck(
    @Body() body: { tenantId: number; channel: ChannelType },
  ) {
    try {
      const isHealthy = await this.crmService.healthCheck(body.channel, body.tenantId);

      return {
        healthy: isHealthy,
        channel: body.channel,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        healthy: false,
        channel: body.channel,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}
