import { cpus } from 'node:os';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  cluster: {
    enabled: boolean;
    workers: number;
  };
  database: {
    url: string;
    logging: boolean;
    synchronize: boolean;
    runMigrationsOnStart: boolean;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenTtlDays: number;
  };
  session: {
    secret: string;
    ttlHours: number;
  };
  openDental: {
    baseUrl: string;
    apiKey: string;
  };
  temporal: {
    baseUrl: string;
    namespace: string;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  cluster: {
    enabled: true,
    workers: Math.max(
      parseInt(process.env.CLUSTER_WORKERS ?? `${cpus().length}`, 10) || cpus().length,
      1,
    ),
  },
  database: {
    url:
      process.env.DATABASE_URL ??
      ((process.env.NODE_ENV ?? 'development') === 'test'
        ? 'postgres://postgres:postgres@localhost:5432/opendental_test'
        : 'postgres://postgres:postgres@localhost:5432/opendental'),
    logging: (process.env.TYPEORM_LOGGING ?? 'false').toLowerCase() === 'true',
    synchronize:
      (process.env.TYPEORM_SYNCHRONIZE ??
        ((process.env.NODE_ENV ?? 'development') === 'production' ? 'false' : 'true'))
        .toLowerCase() === 'true',
    runMigrationsOnStart:
      (process.env.TYPEORM_RUN_MIGRATIONS_ON_START ??
        ((process.env.NODE_ENV ?? 'development') === 'production' ? 'true' : 'false'))
        .toLowerCase() === 'true',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    refreshTokenTtlDays: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS ?? '14', 10),
  },
  session: {
    secret: process.env.SESSION_SECRET ?? 'session-secret',
    ttlHours: parseInt(process.env.SESSION_TTL_HOURS ?? '24', 10),
  },
  openDental: {
    baseUrl: process.env.OPEN_DENTAL_BASE_URL ?? 'https://api.opendental.com/api/v1',
    apiKey: process.env.OPEN_DENTAL_API_KEY ?? 'demo',
  },
  temporal: {
    baseUrl: process.env.TEMPORAL_BASE_URL ?? 'http://localhost:7233',
    namespace: process.env.TEMPORAL_NAMESPACE ?? 'default',
  },
});
