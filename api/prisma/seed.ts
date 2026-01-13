import { PrismaClient, TenantUserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const createdTenants = [];
  const createdDomains = [];

  // Crear o recuperar tenants (idempotente - solo si no existen)
  let tenant1 = await prisma.tenant.findUnique({
    where: { slug: 'barmentech' },
  });
  if (!tenant1) {
    tenant1 = await prisma.tenant.create({
      data: {
        name: 'Barmentech',
        slug: 'barmentech',
        status: 'active',
        billingStatus: 'ok',
        industry: 'SaaS Platform',
        config: {
          website: 'https://www.barmentech.com',
          phone: '+1 (786) 391-8722',
          street: '1110 Brickell Ave # 430K-101',
          city: 'Miami',
          state: 'Florida',
          zipCode: '33131',
          country: 'United States',
          ein: '30-1457024',
          supportEmail: 'support@barmentech.com',
        },
      },
    });
    createdTenants.push(tenant1.name);
  } else {
    // Actualizar config si ya existe
    tenant1 = await prisma.tenant.update({
      where: { id: tenant1.id },
      data: {
        config: {
          website: 'https://www.barmentech.com',
          phone: '+1 (786) 391-8722',
          street: '1110 Brickell Ave # 430K-101',
          city: 'Miami',
          state: 'Florida',
          zipCode: '33131',
          country: 'United States',
          ein: '30-1457024',
          supportEmail: 'support@barmentech.com',
        },
      },
    });
  }

  let tenant2 = await prisma.tenant.findUnique({
    where: { slug: 'tactika-x' },
  });
  if (!tenant2) {
    tenant2 = await prisma.tenant.create({
      data: {
        name: 'Tactika-X',
        slug: 'tactika-x',
        status: 'active',
        billingStatus: 'ok',
        industry: 'Tactical Equipment',
        config: {
          website: 'https://tactika-x.com',
          phone: '+506 2222-3333',
          street: 'Avenida Central 100',
          city: 'San José',
          state: 'SJ',
          zipCode: '10101',
          country: 'Costa Rica',
        },
      },
    });
    createdTenants.push(tenant2.name);
  }

  let tenant3 = await prisma.tenant.findUnique({
    where: { slug: 'sneakers-cr' },
  });
  if (!tenant3) {
    tenant3 = await prisma.tenant.create({
      data: {
        name: 'Sneakers CR',
        slug: 'sneakers-cr',
        status: 'active',
        billingStatus: 'ok',
        industry: 'E-commerce',
        config: {
          logo: 'https://barmentech-saas.atl1.digitaloceanspaces.com/Sneakerscr/LogoSneakers%20(500%20x%20250%20px).png',
          theme: 'sports',
          website: 'https://www.sneakerscr.com',
          brandName: 'Sneakers CR',
        },
      },
    });
    createdTenants.push(tenant3.name);
  }

  let tenant4 = await prisma.tenant.findUnique({
    where: { slug: 'coco-and-nina' },
  });
  if (!tenant4) {
    tenant4 = await prisma.tenant.create({
      data: {
        name: 'Coco and Nina',
        slug: 'coco-and-nina',
        status: 'active',
        billingStatus: 'ok',
        industry: 'E-commerce',
        config: {
          theme: 'fashion',
          website: 'https://www.cocoandnina.com',
          brandName: 'Coco and Nina',
        },
      },
    });
    createdTenants.push(tenant4.name);
  }

  if (createdTenants.length > 0) {
    console.log(`✅ Created tenants: ${createdTenants.join(', ')}`);
  } else {
    console.log('ℹ️  All tenants already exist');
  }

  // Crear dominios para cada tenant (solo si no existen)
  const createDomainIfNotExists = async (tenantId: number, domain: string, isPrimary: boolean) => {
    const existing = await prisma.tenantDomain.findUnique({
      where: { domain },
    });
    if (!existing) {
      const newDomain = await prisma.tenantDomain.create({
        data: {
          tenantId,
          domain,
          isPrimary,
          isActive: true,
        },
      });
      createdDomains.push(domain);
      return newDomain;
    }
    return existing;
  };

  await createDomainIfNotExists(tenant1.id, 'www.barmentech.com', true);
  await createDomainIfNotExists(tenant1.id, 'commerce.barmentech.com', false);
  await createDomainIfNotExists(tenant1.id, 'barmentech-saas.vercel.app', false);
  await createDomainIfNotExists(tenant2.id, 'tactika-x.com', true);
  await createDomainIfNotExists(tenant2.id, 'tactika-x-app.vercel.app', false);
  await createDomainIfNotExists(tenant3.id, 'www.sneakerscr.com', true);
  await createDomainIfNotExists(tenant3.id, 'sneakerscr.vercel.app', false);
  await createDomainIfNotExists(tenant4.id, 'www.cocoandnina.com', true);
  await createDomainIfNotExists(tenant4.id, 'cocoandnina.vercel.app', false);

  if (createdDomains.length > 0) {
    console.log(`✅ Created domains: ${createdDomains.join(', ')}`);
  } else {
    console.log('ℹ️  All domains already exist');
  }

  // Crear usuarios internos (TenantUser) - solo si no existen
  const hashedPassword = await bcrypt.hash('password123', 10);
  const createdUsers = [];

  let adminUser = await prisma.tenantUser.findUnique({
    where: { tenantId_email: { tenantId: tenant1.id, email: 'admin@barmentech.com' } },
  });
  if (!adminUser) {
    adminUser = await prisma.tenantUser.create({
      data: {
        email: 'admin@barmentech.com',
        passwordHash: hashedPassword,
        name: 'Admin Barmentech',
        role: TenantUserRole.owner,
        tenantId: tenant1.id,
        status: 'active',
      },
    });
    createdUsers.push(adminUser.email);
  }

  let managerUser = await prisma.tenantUser.findUnique({
    where: { tenantId_email: { tenantId: tenant2.id, email: 'admin@tactika-x.com' } },
  });
  if (!managerUser) {
    managerUser = await prisma.tenantUser.create({
      data: {
        email: 'admin@tactika-x.com',
        passwordHash: hashedPassword,
        name: 'Admin Tactika-X',
        role: TenantUserRole.owner,
        tenantId: tenant2.id,
        status: 'active',
      },
    });
    createdUsers.push(managerUser.email);
  }

  let sneakersAdmin = await prisma.tenantUser.findUnique({
    where: { tenantId_email: { tenantId: tenant3.id, email: 'admin@sneakers.cr' } },
  });
  if (!sneakersAdmin) {
    sneakersAdmin = await prisma.tenantUser.create({
      data: {
        email: 'admin@sneakers.cr',
        passwordHash: hashedPassword,
        name: 'Admin Sneakers CR',
        role: TenantUserRole.owner,
        tenantId: tenant3.id,
        status: 'active',
      },
    });
    createdUsers.push(sneakersAdmin.email);
  }

  if (createdUsers.length > 0) {
    console.log(`✅ Created tenant users: ${createdUsers.join(', ')}`);
  } else {
    console.log('ℹ️  All tenant users already exist');
  }

  // Crear clientes (Customer) - solo si no existen
  const createdCustomers = [];

  let customer1 = await prisma.customer.findFirst({
    where: {
      email: 'cliente1@example.com',
      tenantId: tenant1.id,
    },
  });
  if (!customer1) {
    customer1 = await prisma.customer.create({
      data: {
        email: 'cliente1@example.com',
        name: 'Juan Pérez',
        phone: '+1234567890',
        tenantId: tenant1.id,
        status: 'active',
      },
    });
    createdCustomers.push(customer1.name);
  }

  let customer2 = await prisma.customer.findFirst({
    where: {
      email: 'cliente2@example.com',
      tenantId: tenant1.id,
    },
  });
  if (!customer2) {
    customer2 = await prisma.customer.create({
      data: {
        email: 'cliente2@example.com',
        name: 'María García',
        phone: '+0987654321',
        tenantId: tenant1.id,
        status: 'active',
      },
    });
    createdCustomers.push(customer2.name);
  }

  if (createdCustomers.length > 0) {
    console.log(`✅ Created customers: ${createdCustomers.join(', ')}`);
  } else {
    console.log('ℹ️  All customers already exist');
  }

  // Crear productos para tenant 1 - solo si no existen
  const createdProducts = [];
  
  const productData = [
    {
      name: 'Laptop HP 15"',
      slug: 'laptop-hp-15',
      description: 'Laptop HP con procesador Intel i5, 8GB RAM, 256GB SSD',
      price: 79999,
      stock: 10,
      productKind: 'physical' as const,
    },
    {
      name: 'Mouse Inalámbrico Logitech',
      slug: 'mouse-logitech',
      description: 'Mouse inalámbrico ergonómico con batería de larga duración',
      price: 2999,
      stock: 50,
      productKind: 'physical' as const,
    },
    {
      name: 'Teclado Mecánico RGB',
      slug: 'teclado-mecanico-rgb',
      description: 'Teclado mecánico con switches azules y retroiluminación RGB',
      price: 8999,
      stock: 25,
      productKind: 'physical' as const,
    },
    {
      name: 'Curso de Programación Online',
      slug: 'curso-programacion',
      description: 'Curso completo de desarrollo web full-stack',
      price: 19999,
      stock: 999,
      productKind: 'digital' as const,
    },
  ];

  const products = await Promise.all(
    productData.map(async (data) => {
      let product = await prisma.product.findFirst({
        where: {
          slug: data.slug,
          tenantId: tenant1.id,
        },
      });
      
      if (!product) {
        product = await prisma.product.create({
          data: {
            ...data,
            tenantId: tenant1.id,
            isActive: true,
          },
        });
        createdProducts.push(product.name);
      }
      
      return product;
    }),
  );

  if (createdProducts.length > 0) {
    console.log(`✅ Created ${createdProducts.length} products for ${tenant1.name}: ${createdProducts.join(', ')}`);
  } else {
    console.log(`ℹ️  All products already exist for ${tenant1.name}`);
  }

  // Crear una orden de ejemplo - solo si no existe
  let order = await prisma.order.findFirst({
    where: {
      tenantId: tenant1.id,
      orderNumber: 'ORD-20241118-0001',
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    order = await prisma.order.create({
      data: {
        tenantId: tenant1.id,
        customerId: customer1.id,
        orderNumber: 'ORD-20241118-0001',
        status: 'pending',
        subtotalAmount: 11998, // 2 x $29.99 + 1 x $89.99 = $119.98
        taxAmount: 0,
        shippingAmount: 0,
        discountAmount: 0,
        totalAmount: 11998,
        currency: 'USD',
        items: {
          create: [
            {
              tenantId: tenant1.id,
              productId: products[1].id,
              quantity: 2,
              unitPrice: 2999,
              totalPrice: 5998,
            },
            {
              tenantId: tenant1.id,
              productId: products[2].id,
              quantity: 1,
              unitPrice: 8999,
              totalPrice: 8999,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });
    console.log(`✅ Created order ${order.orderNumber} with ${order.items.length} items`);
  } else {
    console.log(`ℹ️  Order ${order.orderNumber} already exists`);
  }

  // Crear un pago para la orden - solo si no existe
  let payment = await prisma.payment.findFirst({
    where: {
      tenantId: tenant1.id,
      orderId: order.id,
    },
  });

  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        tenantId: tenant1.id,
        orderId: order.id,
        status: 'paid',
        amount: 11998,
        currency: 'USD',
        provider: 'stripe',
        providerPaymentId: 'pi_test_123456789',
        idempotencyKey: 'idem_' + Date.now(),
      },
    });
    console.log(`✅ Created payment for order ${order.orderNumber}`);

    // Actualizar estado de la orden a pagada
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid' },
    });
  } else {
    console.log(`ℹ️  Payment for order ${order.orderNumber} already exists`);
  }

  console.log('🎉 Seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`  - Tenants created/existing: ${createdTenants.length > 0 ? createdTenants.length : '0 (all already exist)'}`);
  console.log(`  - Domains created/existing: ${createdDomains.length > 0 ? createdDomains.length : '0 (all already exist)'}`);
  console.log(`  - Tenant Users created/existing: ${createdUsers.length > 0 ? createdUsers.length : '0 (all already exist)'}`);
  console.log('\n🔐 Login credentials:');
  console.log(`  Barmentech - Email: admin@barmentech.com`);
  console.log(`  Tactika-X - Email: admin@tactika-x.com`);
  console.log(`  Sneakers CR - Email: admin@sneakers.cr`);
  console.log(`  Password: password123`);
  console.log('\n🌐 Domains:');
  console.log(`  Barmentech: commerce.barmentech.com (ID: ${tenant1.id})`);
  console.log(`  Tactika-X: tactika-x.com (ID: ${tenant2.id})`);
  console.log(`  Sneakers CR: www.sneakerscr.com (ID: ${tenant3.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
