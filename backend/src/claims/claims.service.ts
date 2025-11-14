import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from './claim.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ClinicsService } from '../clinics/clinics.service';
import { PatientsService } from '../patients/patients.service';
import { AppointmentsService } from '../appointments/appointments.service';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private readonly repository: Repository<Claim>,
    private readonly clinicsService: ClinicsService,
    private readonly patientsService: PatientsService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async upsert(dto: CreateClaimDto): Promise<Claim> {
    const clinic = await this.clinicsService.findOne(dto.clinicId);
    const patient = await this.patientsService.findOne(dto.patientId);
    const appointment = await this.appointmentsService.findOne(dto.appointmentId);

    let claim = await this.repository.findOne({ where: { externalClaimId: dto.externalClaimId } });
    if (!claim) {
      claim = this.repository.create({
        externalClaimId: dto.externalClaimId,
        clinic,
        patient,
        appointment,
        amountBilled: dto.amountBilled,
        status: dto.status,
      });
    }

    Object.assign(claim, {
      clinic,
      patient,
      appointment,
      status: dto.status ?? claim.status,
      amountBilled: dto.amountBilled,
      amountApproved: dto.amountApproved,
      rejectionReason: dto.rejectionReason,
      notes: dto.notes,
    });

    return this.repository.save(claim);
  }

  async update(id: string, dto: UpdateClaimDto): Promise<Claim> {
    const claim = await this.repository.findOne({ where: { id }, relations: ['clinic', 'patient', 'appointment'] });
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    Object.assign(claim, dto);
    return this.repository.save(claim);
  }

  async findOne(id: string): Promise<Claim> {
    const claim = await this.repository.findOne({ where: { id }, relations: ['clinic', 'patient', 'appointment'] });
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    return claim;
  }

  async list(clinicId?: string): Promise<Claim[]> {
    return this.repository.find({
      where: clinicId ? { clinic: { id: clinicId } } : {},
      relations: ['clinic', 'patient', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }
}
