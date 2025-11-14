import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './admin.entity';
import { AdminRegisterDto } from '../auth/dto/admin-register.dto';

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

    const passwordHash = await bcrypt.hash(input.password, 12);
    const admin = this.repository.create({
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      passwordHash,
    });

    return this.repository.save(admin);
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { id } });
  }
}
