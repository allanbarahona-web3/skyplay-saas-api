/**
 * Channel Driver Interface
 * Define las operaciones que todo canal debe implementar
 */

import { ChannelType, MessageDirection, MessageStatus } from '@prisma/client';

export interface ChannelMessage {
  id?: string;
  content: string;
  mediaUrl?: string;
  externalId?: string;
  metadata?: Record<string, any>;
}

export interface ChannelWebhookPayload {
  channelUserId: string;
  channelUsername?: string;
  direction: MessageDirection;
  content: string;
  mediaUrl?: string;
  externalId: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface SendMessageParams {
  channelUserId: string;
  message: ChannelMessage;
  conversationMetadata?: Record<string, any>;
}

export interface SendMessageResponse {
  success: boolean;
  externalId?: string;
  status: MessageStatus;
  error?: string;
}

export interface ValidateCredentialsParams {
  apiKey?: string;
  apiSecret?: string;
  phoneNumber?: string;
  webhookUrl?: string;
  [key: string]: any;
}

export interface ValidateCredentialsResponse {
  isValid: boolean;
  error?: string;
}

/**
 * Interface base para todos los drivers de canales
 */
export interface IChannelDriver {
  /**
   * Tipo de canal que implementa
   */
  readonly channel: ChannelType;

  /**
   * Validar que las credenciales son correctas
   */
  validateCredentials(params: ValidateCredentialsParams): Promise<ValidateCredentialsResponse>;

  /**
   * Enviar un mensaje al canal
   */
  sendMessage(params: SendMessageParams): Promise<SendMessageResponse>;

  /**
   * Obtener información del usuario en el canal (si es disponible)
   * Retorna {channelUsername, metadata}
   */
  getChannelUser(channelUserId: string): Promise<{
    channelUsername?: string;
    metadata?: Record<string, any>;
  } | null>;

  /**
   * Webhook handler - procesar eventos entrantes del proveedor
   */
  handleWebhook(payload: any): ChannelWebhookPayload | null;

  /**
   * Marcar un mensaje como entregado en el proveedor
   */
  markAsDelivered(externalId: string): Promise<boolean>;

  /**
   * Marcar un mensaje como leído en el proveedor
   */
  markAsRead(externalId: string): Promise<boolean>;

  /**
   * Health check del canal
   */
  healthCheck(): Promise<boolean>;
}
