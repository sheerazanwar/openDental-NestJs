import 'reflect-metadata';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
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

const common = {
  logging: config.database.logging,
  entities: [Admin, Clinic, Patient, Appointment, Claim, Payment, Session, ActivityLog],
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
};

const dataSourceOptions: DataSourceOptions = isTest
  ? ({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      migrationsRun: false,
      dropSchema: true,
      ...common,
    } satisfies SqliteConnectionOptions)
  : ({
      type: 'postgres',
      url: config.database.url,
      synchronize: synchronizeFlag,
      migrationsRun: runMigrationsFlag,
      dropSchema: false,
      ...common,
    } satisfies PostgresConnectionOptions);

export default new DataSource(dataSourceOptions);
