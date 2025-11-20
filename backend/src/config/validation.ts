import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string = 'postgres://postgres:postgres@localhost:5432/opendental';

  @IsOptional()
  @IsString()
  TYPEORM_LOGGING?: string;

  @IsOptional()
  @IsString()
  TYPEORM_SYNCHRONIZE?: string;

  @IsOptional()
  @IsString()
  TYPEORM_RUN_MIGRATIONS_ON_START?: string;

  @IsString()
  JWT_SECRET: string = 'change-me';

  @IsString()
  JWT_EXPIRES_IN: string = '3600';

  @IsOptional()
  @IsString()
  REFRESH_TOKEN_TTL_DAYS?: string;

  @IsString()
  SESSION_SECRET: string = 'session-secret';

  @IsOptional()
  @IsString()
  SESSION_TTL_HOURS?: string;

  @IsOptional()
  @IsString()
  OPEN_DENTAL_BASE_URL?: string;

  @IsOptional()
  @IsString()
  OPEN_DENTAL_API_KEY?: string;

  @IsOptional()
  @IsString()
  TEMPORAL_BASE_URL?: string;

  @IsOptional()
  @IsString()
  TEMPORAL_NAMESPACE?: string;

  @IsOptional()
  @IsNumber()
  CLUSTER_WORKERS?: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
