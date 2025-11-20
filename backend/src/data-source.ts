import 'reflect-metadata';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
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
const synchronizeFlag = (process.env.TYPEORM_SYNCHRONIZE ?? `${config.database.synchronize}`)
  .toLowerCase()
  .trim() === 'true';

const runMigrationsFlag = (process.env.TYPEORM_RUN_MIGRATIONS_ON_START ?? `${config.database.runMigrationsOnStart}`)
  .toLowerCase()
  .trim() === 'true';

const common = {
  entities: [Admin, Clinic, Patient, Appointment, Claim, Payment, Session, ActivityLog],
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
};

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: config.database.url,
  synchronize: nodeEnv === 'test' ? true : synchronizeFlag,
  migrationsRun: nodeEnv === 'test' ? false : runMigrationsFlag,
  dropSchema: nodeEnv === 'test',
  logging: nodeEnv === 'test' ? false : config.database.logging,
  ...common,
} satisfies PostgresConnectionOptions;

export default new DataSource(dataSourceOptions);
