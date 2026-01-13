/**
 * CRM Webhooks Controller
 * Endpoints públicos para recibir mensajes de canales
 * SIN autenticación JWT
 */

import {
  Controller,
  Post,
  Param,
  Query,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { ChannelType } from '@prisma/client';

@Controller('crm/webhooks')
export class CrmWebhooksController {
  private readonly logger = new Logger(CrmWebhooksController.name);

  constructor(private readonly crmService: CrmService) {}

  /**
   * POST /crm/webhooks/:channel
   * Webhook público para recibir mensajes de canales
   * Requiere: ?tenantId=X en query param
   */
  @Post(':channel')
  async handleWebhook(
    @Param('channel') channel: string,
    @Query('tenantId') tenantIdQuery?: string,
    @Body() payload?: any,
  ) {
    this.logger.log(
      `Webhook received: channel=${channel}, tenantId=${tenantIdQuery}`,
    );

    // Validar que el canal sea válido
    const validChannels = Object.values(ChannelType);
    if (!validChannels.includes(channel as ChannelType)) {
      throw new BadRequestException(`Invalid channel: ${channel}`);
    }

    if (!tenantIdQuery) {
      throw new BadRequestException('Missing tenantId query parameter');
    }

    const tenantId = parseInt(tenantIdQuery);
    if (isNaN(tenantId)) {
      throw new BadRequestException('Invalid tenantId');
    }

    return this.crmService.handleWebhook({
      tenantId,
      channel: channel as ChannelType,
      payload,
    });
  }
}
