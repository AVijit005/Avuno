export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    title: 'Memora API',
    description: 'Memora production backend API',
    version: '0.0.1',
    path: 'docs',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  bullmq: {
    prefix: process.env.BULLMQ_PREFIX || 'memora',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpirySeconds: parseInt(process.env.JWT_ACCESS_EXPIRY_SECONDS || '900', 10),
    refreshExpirySeconds: parseInt(process.env.JWT_REFRESH_EXPIRY_SECONDS || '604800', 10),
  },
  session: {
    ttlSeconds: parseInt(process.env.SESSION_TTL_SECONDS || '604800', 10),
  },
  cookie: {
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
  },
  oauth: {
    encryptionKey: process.env.OAUTH_ENCRYPTION_KEY || (() => { if (process.env.NODE_ENV === 'production') throw new Error('OAUTH_ENCRYPTION_KEY required in production'); return 'default_secret_key_32_bytes_long!'; })(),
  },
  emailVerification: {
    ttlSeconds: parseInt(process.env.EMAIL_VERIFICATION_TTL_SECONDS || '86400', 10),
    required: process.env.EMAIL_VERIFICATION_REQUIRED !== 'false',
    baseUrl: process.env.APP_BASE_URL || 'http://localhost:3000/api',
    successUrl: process.env.EMAIL_VERIFICATION_SUCCESS_URL || 'http://localhost:5173/auth/email-verified',
    failureUrl: process.env.EMAIL_VERIFICATION_FAILURE_URL || 'http://localhost:5173/auth/email-verification-failed',
  },
  storage: {
    driver: process.env.STORAGE_DRIVER || 'local', // 'local' or 's3'
    uploadRoot: process.env.UPLOAD_ROOT || './uploads',
    s3: {
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'auto',
      bucket: process.env.S3_BUCKET,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    }
  },
});
