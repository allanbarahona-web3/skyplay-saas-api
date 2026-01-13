import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Tactika-X API - Multi-tenant E-commerce Platform 🚀';
  }
}
