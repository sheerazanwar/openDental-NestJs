import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { AdminsService } from '../admins/admins.service';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { LoginDto } from './dto/login.dto';
import { SessionsService } from '../sessions/sessions.service';
import { UserType } from '../common/enums/user-type.enum';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
    private readonly configService: ConfigService,
  ) {}

  async registerAdmin(dto: AdminRegisterDto) {
    return this.adminsService.createAdmin(dto);
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string): Promise<AuthResponseDto> {
    const admin = await this.adminsService.findByEmail(dto.email);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const refreshToken = this.generateRefreshToken();
    const refreshTtlDays = this.configService.get<number>('auth.refreshTokenTtlDays') ?? 14;
    const session = await this.sessionsService.createSession({
      userId: admin.id,
      userType: UserType.ADMIN,
      refreshToken,
      expiresAt: new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000),
      userAgent,
      ipAddress,
    });

    const payload = {
      sub: admin.id,
      email: admin.email,
      userType: UserType.ADMIN,
      sessionId: session.id,
      role: admin.role,
    };
    const expiresInConfig = this.configService.get<string>('auth.jwtExpiresIn');
    const expiresInSeconds = this.parseExpiresIn(expiresInConfig);
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: expiresInSeconds,
      secret: this.configService.get<string>('auth.jwtSecret'),
    });

    return {
      accessToken,
      sessionId: session.id,
      expiresIn: expiresInSeconds,
      refreshToken,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const session = await this.sessionsService.validateSession(dto.sessionId, dto.refreshToken);
    const admin = await this.adminsService.findById(session.userId);
    if (!admin) {
      throw new UnauthorizedException('User not found');
    }

    const refreshToken = this.generateRefreshToken();
    const refreshTtlDays = this.configService.get<number>('auth.refreshTokenTtlDays') ?? 14;
    await this.sessionsService.revokeSession(session.id);
    const newSession = await this.sessionsService.createSession({
      userId: admin.id,
      userType: UserType.ADMIN,
      refreshToken,
      expiresAt: new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000),
    });

    const payload = {
      sub: admin.id,
      email: admin.email,
      userType: UserType.ADMIN,
      sessionId: newSession.id,
      role: admin.role,
    };
    const expiresInConfig = this.configService.get<string>('auth.jwtExpiresIn');
    const expiresInSeconds = this.parseExpiresIn(expiresInConfig);
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: expiresInSeconds,
      secret: this.configService.get<string>('auth.jwtSecret'),
    });

    return {
      accessToken,
      sessionId: newSession.id,
      expiresIn: expiresInSeconds,
      refreshToken,
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionsService.revokeSession(sessionId);
  }

  private generateRefreshToken(): string {
    return randomBytes(48).toString('hex');
  }

  private parseExpiresIn(value?: string): number {
    if (!value) {
      return 3600;
    }
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
    const match = value.match(/(\d+)([smhd])/);
    if (!match) {
      return 3600;
    }
    const amount = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return amount;
      case 'm':
        return amount * 60;
      case 'h':
        return amount * 3600;
      case 'd':
        return amount * 86400;
      default:
        return amount;
    }
  }
}
