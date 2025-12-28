import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Centralized configuration following 12-factor app methodology.
 * All environment-specific values are loaded from .env files.
 */

interface Config {
  // Server
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;

  // Database
  MONGODB_URI: string;

  // JWT (Payment-Grade Security)
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;

  // Cookies
  COOKIE_SECRET: string;
  COOKIE_MAX_AGE: number;

  // OAuth 2.0
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;

  // CORS
  FRONTEND_URL: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // Logging
  LOG_LEVEL: string;
}

const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_VERSION: process.env.API_VERSION || 'v1',

  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/secureauth-gateway',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'fallback-secret-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-change-in-production',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  COOKIE_SECRET: process.env.COOKIE_SECRET || 'fallback-cookie-secret',
  COOKIE_MAX_AGE: parseInt(process.env.COOKIE_MAX_AGE || '604800000', 10), // 7 days

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '',

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

export default config;
