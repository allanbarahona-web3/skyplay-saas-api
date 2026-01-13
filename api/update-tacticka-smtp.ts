/**
 * SCRIPT: Update Tacticka SMTP Configuration
 * 
 * Actualiza la configuración SMTP de Tacticka en la BD
 * Ejecución: npx ts-node update-tacticka-smtp.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateTactikaSmtp() {
  try {
    console.log('🔄 Updating Tacticka SMTP configuration...');

    const smtpConfig = {
      provider: 'smtp',
      isActive: true,
      host: 'bh8934.banahosting.com',
      port: 465,
      secure: true,
      auth: {
        user: 'no-replay@tactika-x.com',
        pass: 'r5q*hoQi5(CJ',
      },
      fromAddress: 'no-replay@tactika-x.com',
      fromName: 'Tacticka',
      replyToAddress: 'support@tactika-x.com',
    };

    // Buscar tenant de Tacticka
    const tacticka = await prisma.tenant.findUnique({
      where: { slug: 'tactika-x' },
    });

    if (!tacticka) {
      console.error('❌ Tenant "tactika-x" not found');
      process.exit(1);
    }

    // Actualizar configuración
    const updatedTenant = await prisma.tenant.update({
      where: { id: tacticka.id },
      data: {
        config: {
          ...(tacticka.config as Record<string, any>),
          email: smtpConfig,
        },
      },
    });

    console.log('✅ Tacticka SMTP configuration updated successfully!');
    console.log('📧 Email Config:', {
      provider: smtpConfig.provider,
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.auth.user,
      fromAddress: smtpConfig.fromAddress,
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating SMTP config:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateTactikaSmtp();
