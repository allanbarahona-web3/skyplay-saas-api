import { SetMetadata } from '@nestjs/common';
import { TenantUserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorador para proteger rutas por roles
 * Uso: @Roles(TenantUserRole.owner, TenantUserRole.manager)
 */
export const Roles = (...roles: TenantUserRole[]) => SetMetadata(ROLES_KEY, roles);
