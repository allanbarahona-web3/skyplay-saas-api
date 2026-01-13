import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantUserDto } from './dto/update-tenant-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TenantUsersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, createTenantUserDto: CreateTenantUserDto, creatorRole: string) {
    // Solo owner o manager pueden crear usuarios
    if (creatorRole !== 'owner' && creatorRole !== 'manager') {
      throw new ForbiddenException('Only owners and managers can create users');
    }

    // Verificar si el usuario ya existe
    const existing = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: createTenantUserDto.email,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User already exists');
    }

    // Hash del password
    const passwordHash = await bcrypt.hash(createTenantUserDto.password, 10);

    const user = await this.prisma.tenantUser.create({
      data: {
        tenantId,
        email: createTenantUserDto.email,
        passwordHash,
        name: createTenantUserDto.name,
        role: createTenantUserDto.role || 'staff',
      },
    });

    // Retornar sin el password
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findAllByTenant(tenantId: number) {
    const users = await this.prisma.tenantUser.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    // Retornar sin passwords
    return users.map(({ passwordHash, ...user }) => user);
  }

  async findOne(id: string, tenantId: number) {
    const user = await this.prisma.tenantUser.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async update(id: string, tenantId: number, updateTenantUserDto: UpdateTenantUserDto, updaterRole: string) {
    // Solo owner o manager pueden actualizar usuarios
    if (updaterRole !== 'owner' && updaterRole !== 'manager') {
      throw new ForbiddenException('Only owners and managers can update users');
    }

    await this.findOne(id, tenantId);

    const user = await this.prisma.tenantUser.update({
      where: { id },
      data: updateTenantUserDto,
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async deactivate(id: string, tenantId: number, deactivatorRole: string) {
    // Solo owner puede desactivar usuarios
    if (deactivatorRole !== 'owner') {
      throw new ForbiddenException('Only owners can deactivate users');
    }

    await this.findOne(id, tenantId);

    const user = await this.prisma.tenantUser.update({
      where: { id },
      data: { status: 'inactive' },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async remove(id: string, tenantId: number, removerRole: string) {
    // Solo owner puede eliminar usuarios
    if (removerRole !== 'owner') {
      throw new ForbiddenException('Only owners can delete users');
    }

    await this.findOne(id, tenantId);

    return this.prisma.tenantUser.delete({
      where: { id },
    });
  }
}
