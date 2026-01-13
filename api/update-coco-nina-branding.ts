/**
 * Script para actualizar branding de Coco & Nina
 * Actualiza SOLO los campos de branding, preservando config existente
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCocoNinaBranding() {
  try {
    // 1. Obtener tenant actual de Coco & Nina
    const tenant = await prisma.tenant.findUnique({
      where: { id: 4 },
    });

    if (!tenant) {
      console.error('❌ Tenant ID 4 no encontrado');
      return;
    }

    console.log('📦 Config actual:', JSON.stringify(tenant.config, null, 2));

    // 2. Preparar nueva config (merging con existente)
    const currentConfig = (tenant.config as Record<string, any>) || {};
    const newConfig = {
      ...currentConfig,
      logo: 'https://barmentech-saas.atl1.digitaloceanspaces.com/coco-nina%20/LogoCoco&NinaGris.png',
      brandColor: '#8b7355',
      brandColorDark: '#7a6349',
      website: 'https://www.cocoandnina.com/',
      street: '1110 Brickell Ave # 430K-101',
      city: 'Miami',
      state: 'Florida',
      phone: '+1 (786) 391-8722',
      supportEmail: 'support@barmentech.com',
    };

    // 3. Actualizar tenant
    const updated = await prisma.tenant.update({
      where: { id: 4 },
      data: {
        config: newConfig,
      },
    });

    console.log('✅ Branding actualizado exitosamente');
    console.log('📦 Nueva config:', JSON.stringify(updated.config, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCocoNinaBranding();
