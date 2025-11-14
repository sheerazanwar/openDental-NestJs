import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Session } from './session.entity';
import { UserType } from '../common/enums/user-type.enum';
import { Admin } from '../admins/admin.entity';

interface CreateSessionInput {
  userId: string;
  userType: UserType;
  refreshToken: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
  ) {}

  async createSession(input: CreateSessionInput): Promise<Session> {
    const refreshTokenHash = await bcrypt.hash(input.refreshToken, 12);
    const session = this.repository.create({
      userId: input.userId,
      userType: input.userType,
      refreshTokenHash,
      expiresAt: input.expiresAt,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      admin:
        input.userType === UserType.ADMIN
          ? ({ id: input.userId } as Pick<Admin, 'id'>)
          : undefined,
    });
    return this.repository.save(session);
  }

  async validateSession(sessionId: string, refreshToken: string): Promise<Session> {
    const session = await this.repository.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.revokedAt) {
      throw new UnauthorizedException('Session revoked');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const valid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return session;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.repository.update(sessionId, { revokedAt: new Date() });
  }

  async listSessionsForUser(userId: string): Promise<Session[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
