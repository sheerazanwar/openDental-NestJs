import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { AdminRegisterDto } from '../auth/dto/admin-register.dto';
import { AdminRole } from './enums/admin-role.enum';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly repository: Repository<Admin>,
  ) {}

  async createAdmin(input: AdminRegisterDto): Promise<Admin> {
    const existing = await this.repository.findOne({ where: { email: input.email } });
    if (existing) {
      throw new ConflictException('Administrator already exists');
    }

    const existingCount = await this.repository.count();
    const role = existingCount === 0 ? AdminRole.SUPER_ADMIN : AdminRole.ADMIN;
    const passwordHash = await bcrypt.hash(input.password, 12);
    const admin = this.repository.create({
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      passwordHash,
      role,
    });

    return this.repository.save(admin);
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { id } });
  }

  async listWithClinics(): Promise<Admin[]> {
    return this.repository.find({ relations: ['clinics'], order: { createdAt: 'ASC' } });
  }

  async updatePassword(adminId: string, dto: UpdatePasswordDto): Promise<void> {
    const admin = await this.repository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    const passwordValid = await bcrypt.compare(dto.currentPassword, admin.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    admin.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.repository.save(admin);
  }
}
