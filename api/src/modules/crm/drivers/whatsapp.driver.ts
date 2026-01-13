/**
 * WhatsApp Channel Driver
 * Implementación para canal WhatsApp usando Twilio o similar
 */

import { Logger } from '@nestjs/common';
import {
  IChannelDriver,
  ChannelMessage,
  SendMessageParams,
  SendMessageResponse,
  ValidateCredentialsParams,
  ValidateCredentialsResponse,
  ChannelWebhookPayload,
} from './channel.driver';
import { ChannelType, MessageDirection, MessageStatus } from '@prisma/client';

export class WhatsAppDriver implements IChannelDriver {
  private readonly logger = new Logger(WhatsAppDriver.name);
  readonly channel = ChannelType.whatsapp;

  constructor(private credentials: any) {}

  async validateCredentials(
    params: ValidateCredentialsParams,
  ): Promise<ValidateCredentialsResponse> {
    try {
      // TODO: Implementar validación real con proveedor
      // Por ahora es mock
      if (!params.apiKey || !params.phoneNumber) {
        return {
          isValid: false,
          error: 'Missing required credentials: apiKey and phoneNumber',
        };
      }

      this.logger.log(`Validating WhatsApp credentials for phone: ${params.phoneNumber}`);

      // En producción, hacer llamada al API de Twilio/Messagebird
      return {
        isValid: true,
      };
    } catch (error) {
      this.logger.error('WhatsApp validation failed', error);
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    try {
      const { channelUserId, message } = params;

      this.logger.log(`Sending WhatsApp message to ${channelUserId}`);

      // TODO: Implementar envío real
      // Por ahora es mock - simular envío
      const externalId = `WA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        externalId,
        status: MessageStatus.sent,
      };
    } catch (error) {
      this.logger.error('Failed to send WhatsApp message', error);
      return {
        success: false,
        status: MessageStatus.failed,
        error: error.message,
      };
    }
  }

  async getChannelUser(
    channelUserId: string,
  ): Promise<{ channelUsername?: string; metadata?: Record<string, any> } | null> {
    try {
      // TODO: Implementar obtención real de datos del usuario
      // Por ahora es mock
      return {
        channelUsername: channelUserId,
        metadata: {
          provider: 'whatsapp',
          type: 'individual',
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get WhatsApp user: ${channelUserId}`, error);
      return null;
    }
  }

  handleWebhook(payload: any): ChannelWebhookPayload | null {
    try {
      // Ejemplo: esperamos payload de Twilio
      // {
      //   "AccountSid": "...",
      //   "MessageSid": "...",
      //   "From": "whatsapp:+12345678901",
      //   "To": "whatsapp:+50670000000",
      //   "Body": "Hello",
      //   "MediaUrl0": "..."
      // }

      if (!payload.From || !payload.Body) {
        return null;
      }

      const phoneRegex = /whatsapp:\+?(\d+)/;
      const fromMatch = payload.From.match(phoneRegex);
      if (!fromMatch) return null;

      return {
        channelUserId: fromMatch[1],
        direction: MessageDirection.inbound,
        content: payload.Body,
        mediaUrl: payload.MediaUrl0 || undefined,
        externalId: payload.MessageSid,
        metadata: {
          accountSid: payload.AccountSid,
          provider: 'twilio',
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to process WhatsApp webhook', error);
      return null;
    }
  }

  async markAsDelivered(externalId: string): Promise<boolean> {
    try {
      // TODO: Implementar marcado como entregado
      this.logger.log(`Marking message ${externalId} as delivered`);
      return true;
    } catch (error) {
      this.logger.error('Failed to mark message as delivered', error);
      return false;
    }
  }

  async markAsRead(externalId: string): Promise<boolean> {
    try {
      // TODO: Implementar marcado como leído
      this.logger.log(`Marking message ${externalId} as read`);
      return true;
    } catch (error) {
      this.logger.error('Failed to mark message as read', error);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // TODO: Implementar health check real contra proveedor
      this.logger.log('WhatsApp health check passed');
      return true;
    } catch (error) {
      this.logger.error('WhatsApp health check failed', error);
      return false;
    }
  }
}
