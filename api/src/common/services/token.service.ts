import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * TokenService - Servicio para gestionar JTI (JWT ID) y revocación de tokens
 * 
 * IMPLEMENTACIÓN ACTUAL: PostgreSQL con tabla auth_sessions
 * - Persistente y confiable
 * - Soporta múltiples instancias del servidor
 * - ACID compliant
 * 
 * MEJORAS FUTURAS (opcional):
 * - Agregar Redis como cache para reducir queries a DB
 * - Implementar cleanup job para sesiones expiradas
 */
@Injectable()
export class TokenService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registrar una nueva sesión con tokens
   * @param jti - JWT ID único del access token
   * @param userId - ID del usuario
   * @param tenantId - ID del tenant
   * @param refreshToken - Refresh token
   * @param expiresIn - Tiempo de expiración en segundos
   * @param ipAddress - IP del cliente (opcional)
   * @param userAgent - User agent del cliente (opcional)
   */
  async createSession(
    jti: string,
    userId: string,
    tenantId: number,
    refreshToken: string,
    expiresIn: number = 604800, // 7 días por defecto
    ipAddress?: string,
    userAgent?: string,
  ) {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return this.prisma.authSession.create({
      data: {
        userId,
        tenantId,
        jti,
        refreshToken,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Actualizar el access token JTI de una sesión
   */
  async updateAccessTokenJti(refreshToken: string, accessTokenJti: string) {
    return this.prisma.authSession.update({
      where: { refreshToken },
      data: {
        accessTokenJti,
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * Verificar si un token está revocado
   * @param jti - JWT ID a verificar
   * @returns true si el token está revocado
   */
  async isTokenRevoked(jti: string): Promise<boolean> {
    const session = await this.prisma.authSession.findUnique({
      where: { jti },
      select: { isRevoked: true, expiresAt: true },
    });

    if (!session) {
      return true; // Si no existe, considerarlo revocado
    }

    // Verificar si expiró
    if (new Date() > session.expiresAt) {
      return true;
    }

    return session.isRevoked;
  }

  /**
   * Verificar si un token está activo y no ha expirado
   * @param jti - JWT ID a verificar
   * @returns true si el token está activo
   */
  async isTokenActive(jti: string): Promise<boolean> {
    const isRevoked = await this.isTokenRevoked(jti);
    return !isRevoked;
  }

  /**
   * Revocar un token específico por su JTI
   * @param jti - JWT ID a revocar
   */
  async revokeToken(jti: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { jti },
      data: { isRevoked: true },
    });
  }

  /**
   * Revocar una sesión por refresh token
   */
  async revokeSessionByRefreshToken(refreshToken: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { refreshToken },
      data: { isRevoked: true },
    });
  }

  /**
   * Revocar todos los tokens de un usuario
   * Útil cuando se cambia la contraseña o se cierra sesión en todos los dispositivos
   * @param userId - ID del usuario
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  /**
   * Revocar todos los tokens de un tenant
   * Útil cuando se suspende un tenant
   * @param tenantId - ID del tenant
   */
  async revokeAllTenantTokens(tenantId: number): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { tenantId },
      data: { isRevoked: true },
    });
  }

  /**
   * Obtener sesión por refresh token
   */
  async getSessionByRefreshToken(refreshToken: string) {
    return this.prisma.authSession.findUnique({
      where: { refreshToken },
      include: { user: true },
    });
  }

  /**
   * Obtener sesión por JTI
   */
  async getSessionByJti(jti: string) {
    return this.prisma.authSession.findUnique({
      where: { jti },
      include: { user: true },
    });
  }

  /**
   * Obtener todas las sesiones activas de un usuario
   */
  async getUserActiveSessions(userId: string) {
    return this.prisma.authSession.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  /**
   * Limpiar sesiones expiradas
   * Se debe ejecutar periódicamente (cron job)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.authSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            isRevoked: true,
            createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 días
          },
        ],
      },
    });

    return result.count;
  }

  /**
   * Obtener estadísticas de sesiones
   */
  async getStats() {
    const [total, active, revoked, expired] = await Promise.all([
      this.prisma.authSession.count(),
      this.prisma.authSession.count({
        where: {
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      }),
      this.prisma.authSession.count({
        where: { isRevoked: true },
      }),
      this.prisma.authSession.count({
        where: { expiresAt: { lt: new Date() } },
      }),
    ]);

    return {
      total,
      active,
      revoked,
      expired,
    };
  }
}
