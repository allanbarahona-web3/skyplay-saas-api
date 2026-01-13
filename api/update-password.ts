import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updatePassword() {
  const password = 'demo123';
  const hash = await bcrypt.hash(password, 10);

  const result = await prisma.tenantUser.update({
    where: {
      tenantId_email: {
        tenantId: 1,
        email: 'admin@barmentech.com',
      },
    },
    data: {
      passwordHash: hash,
    },
  });

  console.log('Password updated:', result.email);
  process.exit(0);
}

updatePassword().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
