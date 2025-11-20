import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PollingService } from './polling.service';
import { ClinicsModule } from '../clinics/clinics.module';
import { PatientsModule } from '../patients/patients.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { ClaimsModule } from '../claims/claims.module';
import { PaymentsModule } from '../payments/payments.module';
import { OpenDentalModule } from '../integrations/opendental/opendental.module';
import { TemporalModule } from '../integrations/temporal/temporal.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { DistributedLockService } from '../common/distributed-lock.service';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClinicsModule,
    PatientsModule,
    AppointmentsModule,
    ClaimsModule,
    PaymentsModule,
    OpenDentalModule,
    TemporalModule,
    ActivityLogModule,
    AdminsModule,
  ],
  providers: [PollingService, DistributedLockService],
})
export class PollingModule {}
