/**
 * EMAIL MODULE
 * Módulo para gestión de SMTP y envío de emails por tenant
 */

import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService], // Exportar para otros módulos
})
export class EmailModule {}
