import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { AdminResponseDto } from './dto/admin-response.dto';

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
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    } satisfies AdminResponseDto;
  }
}
