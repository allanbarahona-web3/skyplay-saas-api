import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantUserDto } from './dto/update-tenant-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tenant-users')
@UseGuards(JwtAuthGuard)
export class TenantUsersController {
  constructor(private readonly tenantUsersService: TenantUsersService) {}

  @Post()
  create(@Request() req, @Body() createTenantUserDto: CreateTenantUserDto) {
    return this.tenantUsersService.create(
      req.user.tenantId,
      createTenantUserDto,
      req.user.role,
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.tenantUsersService.findAllByTenant(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.tenantUsersService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTenantUserDto: UpdateTenantUserDto,
  ) {
    return this.tenantUsersService.update(
      id,
      req.user.tenantId,
      updateTenantUserDto,
      req.user.role,
    );
  }

  @Patch(':id/deactivate')
  deactivate(@Request() req, @Param('id') id: string) {
    return this.tenantUsersService.deactivate(id, req.user.tenantId, req.user.role);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.tenantUsersService.remove(id, req.user.tenantId, req.user.role);
  }
}
