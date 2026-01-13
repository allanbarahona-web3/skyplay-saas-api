/**
 * Channel Driver Factory
 * Patrón Factory para instanciar los drivers correctos basado en ChannelType
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ChannelType } from '@prisma/client';
import { IChannelDriver } from '../drivers/channel.driver';
import { WhatsAppDriver } from '../drivers/whatsapp.driver';
import { InstagramDriver } from '../drivers/instagram.driver';

/**
 * Factory que crea instancias de drivers según el tipo de canal
 */
@Injectable()
export class ChannelDriverFactory {
  private readonly logger = new Logger(ChannelDriverFactory.name);

  /**
   * Crear un driver para el canal especificado
   * @param channel - Tipo de canal (whatsapp, instagram, etc)
   * @param credentials - Credenciales necesarias para el canal
   * @returns Instancia del driver correspondiente
   */
  createDriver(channel: ChannelType, credentials: any): IChannelDriver {
    this.logger.log(`Creating driver for channel: ${channel}`);

    switch (channel) {
      case ChannelType.whatsapp:
        return new WhatsAppDriver(credentials);

      case ChannelType.instagram:
        return new InstagramDriver(credentials);

      // Placeholders para otros canales
      case ChannelType.facebook:
        throw new BadRequestException(`Channel ${channel} not yet implemented`);
      case ChannelType.telegram:
        throw new BadRequestException(`Channel ${channel} not yet implemented`);
      case ChannelType.tiktok:
        throw new BadRequestException(`Channel ${channel} not yet implemented`);
      case ChannelType.sms:
        throw new BadRequestException(`Channel ${channel} not yet implemented`);
      case ChannelType.email:
        throw new BadRequestException(`Channel ${channel} not yet implemented`);

      default:
        throw new BadRequestException(`Unknown channel type: ${channel}`);
    }
  }

  /**
   * Obtener lista de canales disponibles (implementados)
   */
  getAvailableChannels(): ChannelType[] {
    return [ChannelType.whatsapp, ChannelType.instagram];
  }

  /**
   * Verificar si un canal está implementado
   */
  isChannelImplemented(channel: ChannelType): boolean {
    return this.getAvailableChannels().includes(channel);
  }
}
