import { Between, In, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ClinicsService } from '../clinics/clinics.service';
import { PatientsService } from '../patients/patients.service';
import { EligibilityStatus } from '../common/enums/eligibility-status.enum';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repository: Repository<Appointment>,
    private readonly clinicsService: ClinicsService,
    private readonly patientsService: PatientsService,
  ) {}

  async upsert(dto: CreateAppointmentDto, user?: AuthenticatedUser): Promise<Appointment> {
    const clinic = await this.clinicsService.assertClinicAccess(dto.clinicId, user);
    const patient = await this.patientsService.findOne(dto.patientId, user);

    let appointment = await this.repository.findOne({ where: { externalAptId: dto.externalAptId } });
    if (!appointment) {
      appointment = this.repository.create({
        externalAptId: dto.externalAptId,
        clinic,
        patient,
        scheduledStart: new Date(dto.scheduledStart),
        scheduledEnd: new Date(dto.scheduledEnd),
      });
    }

    Object.assign(appointment, {
      clinic,
      patient,
      scheduledStart: new Date(dto.scheduledStart),
      scheduledEnd: new Date(dto.scheduledEnd),
      status: dto.status ?? appointment.status,
      reason: dto.reason,
      notes: dto.notes,
      eligibilityStatus: dto.eligibilityStatus ?? appointment.eligibilityStatus ?? EligibilityStatus.PENDING,
      eligibilityDetails: dto.eligibilityDetails ?? appointment.eligibilityDetails,
      insuranceCoverageAmount: dto.insuranceCoverageAmount,
      patientResponsibilityAmount: dto.patientResponsibilityAmount,
      discountAmount: dto.discountAmount,
      operatory: dto.operatory,
      providerName: dto.providerName,
    });

    return this.repository.save(appointment);
  }

  async update(id: string, dto: UpdateAppointmentDto, user?: AuthenticatedUser): Promise<Appointment> {
    const appointment = await this.repository.findOne({ where: { id }, relations: ['patient', 'clinic'] });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (user) {
      await this.clinicsService.assertClinicAccess(appointment.clinic.id, user);
    }

    Object.assign(appointment, {
      ...dto,
      scheduledStart: dto.scheduledStart ? new Date(dto.scheduledStart) : appointment.scheduledStart,
      scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : appointment.scheduledEnd,
    });

    return this.repository.save(appointment);
  }

  async updateEligibility(
    appointmentId: string,
    status: EligibilityStatus,
    details?: Record<string, any>,
  ): Promise<Appointment> {
    const appointment = await this.findOne(appointmentId);
    appointment.eligibilityStatus = status;
    appointment.eligibilityDetails = details;
    return this.repository.save(appointment);
  }

  async findUpcomingForClinic(clinicId: string, start: Date, end: Date): Promise<Appointment[]> {
    return this.repository.find({
      where: {
        clinic: { id: clinicId },
        scheduledStart: Between(start, end),
      },
      relations: ['patient'],
      order: { scheduledStart: 'ASC' },
    });
  }

  async findOne(id: string, user?: AuthenticatedUser): Promise<Appointment> {
    const appointment = await this.repository.findOne({ where: { id }, relations: ['patient', 'clinic'] });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (user) {
      await this.clinicsService.assertClinicAccess(appointment.clinic.id, user);
    }
    return appointment;
  }

  async list(clinicId?: string, user?: AuthenticatedUser): Promise<Appointment[]> {
    const clinicIds = await this.clinicsService.getAccessibleClinicIds(user, clinicId);
    if (!clinicIds.length) {
      return [];
    }
    return this.repository.find({
      where: { clinic: { id: In(clinicIds) } },
      relations: ['patient', 'clinic'],
      order: { scheduledStart: 'DESC' },
    });
  }
}
