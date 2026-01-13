import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController, PublicContactController } from './leads.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [LeadsController, PublicContactController],
  providers: [LeadsService],
})
export class LeadsModule {}
