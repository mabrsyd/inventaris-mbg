import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3030,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  jwt: {
    secret: (process.env.JWT_SECRET || 'your-secret-key'),
    refreshSecret: (process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'),
    accessTokenExpiry: (process.env.JWT_ACCESS_EXPIRY || '15m'),
    refreshTokenExpiry: (process.env.JWT_REFRESH_EXPIRY || '7d'),
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },
};
