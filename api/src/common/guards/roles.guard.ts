import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantUserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard para verificar que el usuario tiene los roles necesarios
 * Se usa junto con el decorador @Roles()
 * 
 * ESPECIAL: El rol 'admin' (superadmin) tiene acceso a TODO
 * sin necesidad de validación adicional
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<TenantUserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Admin (superadmin global) tiene acceso a TODO
    if (user.role === 'admin') {
      return true;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
