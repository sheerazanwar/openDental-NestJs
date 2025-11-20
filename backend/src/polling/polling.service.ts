import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OpenDentalService } from '../integrations/opendental/opendental.service';
import { PatientsService } from '../patients/patients.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { ClaimsService } from '../claims/claims.service';
import { PaymentsService } from '../payments/payments.service';
import { TemporalService } from '../integrations/temporal/temporal.service';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { EligibilityStatus } from '../common/enums/eligibility-status.enum';
import { ClaimStatus } from '../common/enums/claim-status.enum';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityAction } from '../common/enums/activity-action.enum';
import { UserType } from '../common/enums/user-type.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { DistributedLockService } from '../common/distributed-lock.service';
import { AdminsService } from '../admins/admins.service';
import { Clinic } from '../clinics/clinic.entity';

@Injectable()
export class PollingService {
  private readonly logger = new Logger(PollingService.name);

  constructor(
    private readonly openDentalService: OpenDentalService,
    private readonly patientsService: PatientsService,
    private readonly appointmentsService: AppointmentsService,
    private readonly claimsService: ClaimsService,
    private readonly paymentsService: PaymentsService,
    private readonly temporalService: TemporalService,
    private readonly activityService: ActivityLogService,
    private readonly lockService: DistributedLockService,
    private readonly adminsService: AdminsService,
  ) {}

  private async getClinicsGroupedByAdmins(): Promise<Clinic[]> {
    const admins = await this.adminsService.listWithClinics();
    return admins.flatMap((admin) => admin.clinics ?? []);
  }

  @Cron('0 */15 * * * *')
  async syncUpcomingAppointments(): Promise<void> {
    await this.lockService.withLock('polling:sync-upcoming-appointments', async () => {
      const clinics = await this.getClinicsGroupedByAdmins();
      for (const clinic of clinics) {
        const appointments = await this.openDentalService.fetchUpcomingAppointments(clinic.id);
        for (const appointment of appointments) {
          const patient = await this.patientsService.upsert(clinic.id, {
            externalId: appointment.PatNum,
            firstName: 'Unknown',
            lastName: 'Patient',
          });
          await this.appointmentsService.upsert({
            externalAptId: appointment.AptNum,
            clinicId: clinic.id,
            patientId: patient.id,
            scheduledStart: new Date(appointment.AptDateTime).toISOString(),
            scheduledEnd: new Date(new Date(appointment.AptDateTime).getTime() + appointment.AptLength * 60000).toISOString(),
            status: this.mapAppointmentStatus(appointment.AptStatus),
            notes: appointment.Note,
            providerName: appointment.ProviderNum,
          });
        }
      }
    });
  }

  @Cron('0 */5 * * * *')
  async syncTodaysAppointments(): Promise<void> {
    await this.lockService.withLock('polling:sync-todays-appointments', async () => {
      const clinics = await this.getClinicsGroupedByAdmins();
      for (const clinic of clinics) {
        const appointments = await this.openDentalService.fetchTodaysAppointments(clinic.id);
        for (const appointment of appointments) {
          const patient = await this.patientsService.upsert(clinic.id, {
            externalId: appointment.PatNum,
            firstName: 'Unknown',
            lastName: 'Patient',
          });
          await this.appointmentsService.upsert({
            externalAptId: appointment.AptNum,
            clinicId: clinic.id,
            patientId: patient.id,
            scheduledStart: new Date(appointment.AptDateTime).toISOString(),
            scheduledEnd: new Date(new Date(appointment.AptDateTime).getTime() + appointment.AptLength * 60000).toISOString(),
            status: this.mapAppointmentStatus(appointment.AptStatus),
            notes: appointment.Note,
          });
        }
      }
    });
  }

  @Cron('0 */10 * * * *')
  async syncCompletedAppointments(): Promise<void> {
    await this.lockService.withLock('polling:sync-completed-appointments', async () => {
      const clinics = await this.getClinicsGroupedByAdmins();
      for (const clinic of clinics) {
        const appointments = await this.openDentalService.fetchCompletedAppointments(clinic.id);
        for (const appointment of appointments) {
          const patient = await this.patientsService.upsert(clinic.id, {
            externalId: appointment.PatNum,
            firstName: 'Unknown',
            lastName: 'Patient',
          });
          await this.appointmentsService.upsert({
            externalAptId: appointment.AptNum,
            clinicId: clinic.id,
            patientId: patient.id,
            scheduledStart: new Date(appointment.AptDateTime).toISOString(),
            scheduledEnd: new Date(new Date(appointment.AptDateTime).getTime() + appointment.AptLength * 60000).toISOString(),
            status: AppointmentStatus.COMPLETED,
            notes: appointment.Note,
          });
        }
      }
    });
  }

  @Cron('0 */30 * * * *')
  async syncEligibility(): Promise<void> {
    await this.lockService.withLock('polling:sync-eligibility', async () => {
      const clinics = await this.getClinicsGroupedByAdmins();
      for (const clinic of clinics) {
        const appointments = await this.appointmentsService.list(clinic.id);
        for (const appointment of appointments.filter((apt) => apt.eligibilityStatus === EligibilityStatus.PENDING)) {
          const eligibility = await this.openDentalService.checkEligibility(appointment.externalAptId);
          if (eligibility.Eligible) {
            await this.appointmentsService.updateEligibility(
              appointment.id,
              EligibilityStatus.APPROVED,
              eligibility as any,
            );
          } else {
            await this.appointmentsService.updateEligibility(
              appointment.id,
              EligibilityStatus.REJECTED,
              eligibility as any,
            );
          }
        }
      }
    });
  }

  @Cron('0 0 * * * *')
  async syncClaims(): Promise<void> {
    await this.lockService.withLock('polling:sync-claims', async () => {
      const clinics = await this.getClinicsGroupedByAdmins();
      for (const clinic of clinics) {
        const claims = await this.claimsService.list(clinic.id);
        for (const claim of claims.filter((clm) => clm.status !== ClaimStatus.PAID)) {
          const status = await this.openDentalService.fetchClaimStatus(claim.externalClaimId);
          if (status.Status === 'Received') {
            await this.claimsService.update(claim.id, { status: ClaimStatus.SUBMITTED });
          } else if (status.Status === 'Accepted') {
            await this.claimsService.update(claim.id, { status: ClaimStatus.APPROVED });
          } else if (status.Status === 'Rejected') {
            await this.claimsService.update(claim.id, {
              status: ClaimStatus.REJECTED,
              rejectionReason: 'OpenDental rejection',
            });
          }

          await this.temporalService.enqueueJob({
            workflow: 'ClaimStatusWorkflow',
            payload: {
              claimId: claim.id,
              status: status.Status,
            },
          });
        }
      }
    });
  }

  @Cron('0 15 * * * *')
  async syncPayments(): Promise<void> {
    await this.lockService.withLock('polling:sync-payments', async () => {
      const clinics = await this.getClinicsGroupedByAdmins();
      for (const clinic of clinics) {
        const claims = await this.claimsService.list(clinic.id);
        for (const claim of claims.filter((clm) => clm.status === ClaimStatus.APPROVED)) {
          const paymentPayload = await this.openDentalService.fetchClaimStatus(claim.externalClaimId);
          if (paymentPayload.TotalFee) {
            await this.paymentsService.upsert({
              clinicId: clinic.id,
              claimId: claim.id,
              amount: paymentPayload.TotalFee,
              status: PaymentStatus.PAID,
            });
            await this.claimsService.update(claim.id, { status: ClaimStatus.PAID });
          }
        }
      }
    });
  }

  @Cron('0 0 0 * * *')
  async logSystemHeartbeat(): Promise<void> {
    await this.lockService.withLock('polling:log-heartbeat', async () => {
      await this.activityService.createLog({
        userType: UserType.ADMIN,
        userId: 'system',
        action: ActivityAction.SYSTEM,
        metadata: { message: 'Daily polling heartbeat' },
      });
    });
  }

  private mapAppointmentStatus(status: string): AppointmentStatus {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return AppointmentStatus.SCHEDULED;
      case 'confirmed':
        return AppointmentStatus.CONFIRMED;
      case 'arrived':
        return AppointmentStatus.CHECKED_IN;
      case 'complete':
      case 'completed':
        return AppointmentStatus.COMPLETED;
      case 'noshow':
      case 'no_show':
        return AppointmentStatus.NO_SHOW;
      case 'cancelled':
      case 'canceled':
        return AppointmentStatus.CANCELLED;
      default:
        return AppointmentStatus.SCHEDULED;
    }
  }
}
