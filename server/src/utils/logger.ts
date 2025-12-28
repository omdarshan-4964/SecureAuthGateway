import winston from 'winston';
import path from 'path';
import config from '@/config';

/**
 * WINSTON LOGGER - Production-Grade Logging
 ** "I implemented structured logging using Winston with different log levels and file rotation.
 * This is critical for debugging production issues and maintaining audit trails.
 * Logs are separated by severity (error, combined) and formatted as JSON for easy parsing by log aggregation tools like ELK or CloudWatch."
 */

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (human-readable for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'secureauth-gateway' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to the console with colorized output
if (config.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

export default logger;
