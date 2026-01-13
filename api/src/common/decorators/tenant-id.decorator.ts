import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para obtener el tenantId del usuario autenticado
 * Uso: @TenantId() tenantId: number
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    // tenantId viene como number del JWT (ya validado y tipado)
    const tenantId = request.user?.tenantId;
    if (typeof tenantId === 'string') {
      return parseInt(tenantId, 10); // Fallback para compatibilidad
    }
    return tenantId;
  },
);
