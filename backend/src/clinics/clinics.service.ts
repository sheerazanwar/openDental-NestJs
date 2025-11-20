import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from './clinic.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { AdminsService } from '../admins/admins.service';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private readonly repository: Repository<Clinic>,
    private readonly adminsService: AdminsService,
  ) {}

  async create(adminId: string, dto: CreateClinicDto): Promise<Clinic> {
    const admin = await this.adminsService.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    const clinic = this.repository.create({
      ...dto,
      admin,
    });
    return this.repository.save(clinic);
  }

  async findAll(): Promise<Clinic[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.repository.findOne({ where: { id } });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    return clinic;
  }

  async update(id: string, dto: UpdateClinicDto): Promise<Clinic> {
    const clinic = await this.findOne(id);
    Object.assign(clinic, dto);
    return this.repository.save(clinic);
  }
}
