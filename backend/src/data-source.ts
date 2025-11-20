import 'reflect-metadata';
import { join } from 'path';
import { DataSource } from 'typeorm';
import configuration from './config/configuration';
import { Admin } from './admins/admin.entity';
import { Clinic } from './clinics/clinic.entity';
import { Patient } from './patients/patient.entity';
import { Appointment } from './appointments/appointment.entity';
import { Claim } from './claims/claim.entity';
import { Payment } from './payments/payment.entity';
import { Session } from './sessions/session.entity';
import { ActivityLog } from './activity-log/activity-log.entity';

const config = configuration();
const nodeEnv = config.nodeEnv ?? 'development';
const isTest = nodeEnv === 'test';
const synchronizeFlag = (process.env.TYPEORM_SYNCHRONIZE ?? `${config.database.synchronize}`)
  .toLowerCase()
  .trim() === 'true';

const runMigrationsFlag = (process.env.TYPEORM_RUN_MIGRATIONS_ON_START ?? `${config.database.runMigrationsOnStart}`)
  .toLowerCase()
  .trim() === 'true';

export default new DataSource({
  type: isTest ? 'sqlite' : 'postgres',
  database: isTest ? ':memory:' : undefined,
  url: isTest ? undefined : config.database.url,
  logging: config.database.logging,
  synchronize: synchronizeFlag,
  migrationsRun: runMigrationsFlag,
  dropSchema: isTest,
  entities: [Admin, Clinic, Patient, Appointment, Claim, Payment, Session, ActivityLog],
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
});
