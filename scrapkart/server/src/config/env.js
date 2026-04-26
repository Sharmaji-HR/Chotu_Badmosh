const parseOrigins = (origins) => {
  if (!origins) {
    return [];
  }

  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const getServerConfig = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  const mongoUri = (process.env.MONGODB_URI || '').trim();
  const jwtSecret = (process.env.JWT_SECRET || '').trim();

  if (!mongoUri) {
    throw new Error('Missing required environment variable: MONGODB_URI');
  }

  if (!jwtSecret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }

  if (isProduction && jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }

  const corsOriginInput = process.env.CLIENT_URLS || process.env.CLIENT_URL || '';

  return {
    nodeEnv,
    isProduction,
    port: Number(process.env.PORT) || 5000,
    mongoUri,
    jwtSecret,
    corsOrigins: parseOrigins(corsOriginInput),
    enableDefaultAdmin: process.env.ENABLE_DEFAULT_ADMIN === 'true',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@carscrap.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  };
};

module.exports = {
  getServerConfig,
};
