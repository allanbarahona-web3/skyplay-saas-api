import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Connected to PostgreSQL database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Disconnected from PostgreSQL database');
  }

  /**
   * Método helper para limpiar la base de datos (útil en testing)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => key !== '_engine' && key !== '_fetcher' && typeof key === 'string'
    );

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof PrismaService];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as any).deleteMany();
        }
      })
    );
  }

  /**
   * Método helper para ejecutar queries con RLS (Row Level Security)
   * 
   * Este método está preparado para activar RLS en PostgreSQL usando app.tenant_id.
   * 
   * Cuando se active RLS en producción, este método:
   * 1. Iniciará una transacción
   * 2. Ejecutará: SELECT set_config('app.tenant_id', $tenantId::text, false)
   * 3. Ejecutará el callback con las queries dentro de la transacción
   * 4. Las políticas RLS en PostgreSQL filtrarán automáticamente por app.tenant_id
   * 
   * Ejemplo de uso:
   * ```
   * await prisma.withTenant(tenantId, async (tx) => {
   *   // Todas las queries aquí respetan RLS automáticamente
   *   const products = await tx.product.findMany();
   *   return products;
   * });
   * ```
   * 
   * RLS está activado en PostgreSQL con políticas que usan:
   * WHERE "tenantId" = current_setting('app.tenant_id')::int
   * 
   * @param tenantId - El ID del tenant para filtrar datos (tipo number/integer)
   * @param callback - Función que ejecuta queries dentro del contexto del tenant
   */
  async withTenant<T>(tenantId: number, callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      // Configurar app.tenant_id para RLS
      // set_config requiere el valor como string, pero PostgreSQL lo convierte a integer en las políticas
      await tx.$executeRawUnsafe(
        `SELECT set_config('app.tenant_id', $1::text, false)`,
        String(tenantId),
      );
      
      // Ejecutar queries del callback - automáticamente filtradas por RLS
      return callback(tx as PrismaClient);
    });
  }
}
