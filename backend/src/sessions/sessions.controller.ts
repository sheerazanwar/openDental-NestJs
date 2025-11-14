import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SessionResponseDto } from './dto/session-response.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'List active sessions for the authenticated user' })
  @ApiOkResponse({ type: SessionResponseDto, isArray: true })
  async list(@CurrentUser() user: AuthenticatedUser) {
    const sessions = await this.sessionsService.listSessionsForUser(user.userId);
    return sessions.map((session) => ({
      id: session.id,
      userType: session.userType,
      userId: session.userId,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke a specific session' })
  async revoke(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const sessions = await this.sessionsService.listSessionsForUser(user.userId);
    if (!sessions.some((session) => session.id === id)) {
      return { message: 'Session already revoked or belongs to another user' };
    }
    await this.sessionsService.revokeSession(id);
    return { message: 'Session revoked' };
  }

  @Post('revoke-all')
  @ApiOperation({ summary: 'Revoke all other active sessions for the authenticated user' })
  async revokeAll(@CurrentUser() user: AuthenticatedUser, @Req() request: any) {
    const sessions = await this.sessionsService.listSessionsForUser(user.userId);
    const currentSessionId = request.user.sessionId as string | undefined;
    await Promise.all(
      sessions
        .filter((session) => session.id !== currentSessionId)
        .map((session) => this.sessionsService.revokeSession(session.id)),
    );
    return { message: 'All other sessions revoked' };
  }
}
