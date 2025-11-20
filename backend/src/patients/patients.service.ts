import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ClinicsService } from '../clinics/clinics.service';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly repository: Repository<Patient>,
    private readonly clinicsService: ClinicsService,
  ) {}

  async upsert(clinicId: string, dto: CreatePatientDto, user?: AuthenticatedUser): Promise<Patient> {
    const clinic = await this.clinicsService.assertClinicAccess(clinicId, user);
    let patient = await this.repository.findOne({ where: { externalId: dto.externalId } });
    if (!patient) {
      patient = this.repository.create({ ...dto, clinic });
    } else {
      Object.assign(patient, dto);
      patient.clinic = clinic;
    }
    return this.repository.save(patient);
  }

  async update(id: string, dto: UpdatePatientDto, user?: AuthenticatedUser): Promise<Patient> {
    const patient = await this.repository.findOne({ where: { id }, relations: ['clinic'] });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    if (user) {
      await this.clinicsService.assertClinicAccess(patient.clinic.id, user);
    }
    Object.assign(patient, dto);
    return this.repository.save(patient);
  }

  async findAll(clinicId?: string, user?: AuthenticatedUser): Promise<Patient[]> {
    const clinicIds = await this.clinicsService.getAccessibleClinicIds(user, clinicId);
    if (!clinicIds.length) {
      return [];
    }
    return this.repository.find({
      where: { clinic: { id: In(clinicIds) } },
      order: { lastName: 'ASC', firstName: 'ASC' },
      relations: ['clinic'],
    });
  }

  async findOne(id: string, user?: AuthenticatedUser): Promise<Patient> {
    const patient = await this.repository.findOne({ where: { id }, relations: ['clinic'] });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    if (user) {
      await this.clinicsService.assertClinicAccess(patient.clinic.id, user);
    }
    return patient;
  }
}
