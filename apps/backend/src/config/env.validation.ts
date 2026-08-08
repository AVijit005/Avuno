import { IsBoolean, IsNumber, IsOptional, IsString, Matches, Max, Min, MinLength, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class EnvironmentVariables {
  @IsString()
  NODE_ENV: string = 'development';

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD: string = '';

  @IsNumber()
  @Min(0)
  @IsOptional()
  REDIS_DB: number = 0;

  @IsString()
  @IsOptional()
  BULLMQ_PREFIX: string = 'chronicle';

  @IsBoolean()
  @IsOptional()
  SWAGGER_ENABLED: boolean = false;

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api';

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET: string;

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET: string;

  /**
   * 32 bytes as 64 hex characters: openssl rand -hex 32
   *
   * Validated here so a missing or short key fails at boot rather than at the
   * first OAuth login. Optional overall because Google sign-in can be left
   * unconfigured; the format check applies whenever a value is supplied.
   */
  @IsString()
  @Matches(/^[0-9a-fA-F]{64}$/, {
    message: 'OAUTH_ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate one with: openssl rand -hex 32',
  })
  @IsOptional()
  OAUTH_ENCRYPTION_KEY?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  JWT_ACCESS_EXPIRY_SECONDS: number = 900;

  @IsNumber()
  @Min(1)
  @IsOptional()
  JWT_REFRESH_EXPIRY_SECONDS: number = 604800;

  @IsNumber()
  @Min(1)
  @IsOptional()
  SESSION_TTL_SECONDS: number = 604800;

  @IsString()
  @IsOptional()
  COOKIE_DOMAIN: string = '';

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID: string = '';

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET: string = '';

  @IsString()
  @IsOptional()
  GOOGLE_CALLBACK_URL: string = 'http://localhost:3000/api/auth/google/callback';

  @IsNumber()
  @Min(1)
  @IsOptional()
  EMAIL_VERIFICATION_TTL_SECONDS: number = 86400;

  @IsBoolean()
  @IsOptional()
  EMAIL_VERIFICATION_REQUIRED: boolean = true;

  @IsString()
  @IsOptional()
  APP_BASE_URL: string = 'http://localhost:3000/api';

  @IsString()
  @IsOptional()
  EMAIL_VERIFICATION_SUCCESS_URL: string = 'http://localhost:5173/auth/email-verified';

  @IsString()
  @IsOptional()
  EMAIL_VERIFICATION_FAILURE_URL: string = 'http://localhost:5173/auth/email-verification-failed';
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
