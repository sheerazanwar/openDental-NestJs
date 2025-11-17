import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ClinicsService } from '../clinics/clinics.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly repository: Repository<Patient>,
    private readonly clinicsService: ClinicsService,
  ) {}

  async upsert(clinicId: string, dto: CreatePatientDto): Promise<Patient> {
    const clinic = await this.clinicsService.findOne(clinicId);
    let patient = await this.repository.findOne({ where: { externalId: dto.externalId } });
    if (!patient) {
      patient = this.repository.create({ ...dto, clinic });
    } else {
      Object.assign(patient, dto);
      patient.clinic = clinic;
    }
    return this.repository.save(patient);
  }

  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.repository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    Object.assign(patient, dto);
    return this.repository.save(patient);
  }

  async findAll(clinicId?: string): Promise<Patient[]> {
    return this.repository.find({
      where: clinicId ? { clinic: { id: clinicId } } : {},
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.repository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }
}
