import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Claim } from './claim.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ClinicsService } from '../clinics/clinics.service';
import { PatientsService } from '../patients/patients.service';
import { AppointmentsService } from '../appointments/appointments.service';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private readonly repository: Repository<Claim>,
    private readonly clinicsService: ClinicsService,
    private readonly patientsService: PatientsService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async upsert(dto: CreateClaimDto, user?: AuthenticatedUser): Promise<Claim> {
    const clinic = await this.clinicsService.assertClinicAccess(dto.clinicId, user);
    const patient = await this.patientsService.findOne(dto.patientId, user);
    const appointment = await this.appointmentsService.findOne(dto.appointmentId, user);

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

  async update(id: string, dto: UpdateClaimDto, user?: AuthenticatedUser): Promise<Claim> {
    const claim = await this.repository.findOne({ where: { id }, relations: ['clinic', 'patient', 'appointment'] });
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    if (user) {
      await this.clinicsService.assertClinicAccess(claim.clinic.id, user);
    }

    Object.assign(claim, dto);
    return this.repository.save(claim);
  }

  async findOne(id: string, user?: AuthenticatedUser): Promise<Claim> {
    const claim = await this.repository.findOne({ where: { id }, relations: ['clinic', 'patient', 'appointment'] });
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    if (user) {
      await this.clinicsService.assertClinicAccess(claim.clinic.id, user);
    }
    return claim;
  }

  async list(clinicId?: string, user?: AuthenticatedUser): Promise<Claim[]> {
    const clinicIds = await this.clinicsService.getAccessibleClinicIds(user, clinicId);
    if (!clinicIds.length) {
      return [];
    }
    return this.repository.find({
      where: { clinic: { id: In(clinicIds) } },
      relations: ['clinic', 'patient', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }
}
