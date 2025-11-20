import { Body, Controller, ForbiddenException, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { AdminResponseDto } from './dto/admin-response.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AdminRegisterDto } from '../auth/dto/admin-register.dto';
import { AdminRole } from './enums/admin-role.enum';

@ApiTags('Administrators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retrieve the profile of the authenticated administrator' })
  @ApiOkResponse({ type: AdminResponseDto })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    const admin = await this.adminsService.findById(user.userId);
    if (!admin) {
      return null;
    }
    return {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    } satisfies AdminResponseDto;
  }

  @Patch('password')
  @ApiOperation({ summary: 'Update the authenticated administrator password' })
  @ApiOkResponse({ description: 'Password updated successfully' })
  async updatePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePasswordDto) {
    await this.adminsService.updatePassword(user.userId, dto);
    return { message: 'Password updated' };
  }

  @Post('super')
  @ApiOperation({
    summary:
      'Create a new super administrator (only available to existing super administrators in Swagger)',
  })
  @ApiOkResponse({ description: 'Super administrator created successfully' })
  async createSuperAdmin(@CurrentUser() user: AuthenticatedUser, @Body() dto: AdminRegisterDto) {
    if (user.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super administrators can create new super administrators');
    }

    return this.adminsService.createSuperAdmin(dto);
  }
}
