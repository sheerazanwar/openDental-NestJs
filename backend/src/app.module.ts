import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import configuration from './config/configuration';
import { validate } from './config/validation';
import { Admin } from './admins/admin.entity';
import { Clinic } from './clinics/clinic.entity';
import { Patient } from './patients/patient.entity';
import { Appointment } from './appointments/appointment.entity';
import { Claim } from './claims/claim.entity';
import { Payment } from './payments/payment.entity';
import { Session } from './sessions/session.entity';
import { ActivityLog } from './activity-log/activity-log.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './admins/admins.module';
import { ClinicsModule } from './clinics/clinics.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClaimsModule } from './claims/claims.module';
import { PaymentsModule } from './payments/payments.module';
import { SessionsModule } from './sessions/sessions.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { OpenDentalModule } from './integrations/opendental/opendental.module';
import { TemporalModule } from './integrations/temporal/temporal.module';
import { PollingModule } from './polling/polling.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('nodeEnv');
        const synchronize = configService.get<boolean>('database.synchronize');
        const runMigrations = configService.get<boolean>('database.runMigrationsOnStart');
        const common = {
          entities: [Admin, Clinic, Patient, Appointment, Claim, Payment, Session, ActivityLog],
          migrations: [join(__dirname, 'migrations/*.{ts,js}')],
        };
        const isTest = nodeEnv === 'test';
        return {
          type: 'postgres',
          url: configService.get<string>('database.url'),
          logging: isTest ? false : configService.get<boolean>('database.logging'),
          synchronize: isTest ? true : synchronize,
          migrationsRun: isTest ? false : runMigrations,
          dropSchema: isTest,
          ...common,
        } as const;
      },
    }),
    AuthModule,
    AdminsModule,
    ClinicsModule,
    PatientsModule,
    AppointmentsModule,
    ClaimsModule,
    PaymentsModule,
    SessionsModule,
    ActivityLogModule,
    OpenDentalModule,
    TemporalModule,
    PollingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
