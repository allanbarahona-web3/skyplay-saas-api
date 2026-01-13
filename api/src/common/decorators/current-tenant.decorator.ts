import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para obtener el tenantId del usuario autenticado
 * Alias para @TenantId() - más descriptivo
 * Uso: @CurrentTenant() tenantId: number
 */
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    // Primero intenta obtener tenantId del usuario autenticado (JWT)
    let tenantId = request.user?.tenantId;
    
    // Si no hay usuario (endpoint público), usa el tenantId del host/dominio
    if (!tenantId) {
      tenantId = request.tenantIdFromHost;
    }
    
    if (typeof tenantId === 'string') {
      return parseInt(tenantId, 10); // Fallback para compatibilidad
    }
    return tenantId;
  },
);
