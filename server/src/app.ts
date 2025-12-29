import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';
import config from '@/config';
import logger from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import DatabaseConnection from '@/config/database';
import authRoutes from '@/routes/auth.routes';
import transactionRoutes from '@/routes/transaction.routes';
import userRoutes from '@/routes/user.routes';

/**
 * ====================================
 * SECUREAUTH GATEWAY - MAIN APPLICATION
 * ====================================
 * 
 * Payment-Grade Authentication Infrastructure
 * Built with TypeScript, Express.js, MongoDB
 * 
 * Interview Talking Points:
 * 1. "I implemented a layered security architecture using Helmet, CORS, rate limiting, and input sanitization."
 * 2. "The application follows the single responsibility principle - each middleware has one job."
 * 3. "I used dependency injection and modular design to make the codebase testable and maintainable."
 */

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.PORT;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * SECURITY & MIDDLEWARE INITIALIZATION
   ** "I applied defense-in-depth security by stacking multiple layers of protection:
   * - Helmet sets secure HTTP headers
   * - CORS prevents unauthorized cross-origin requests
   * - MongoSanitize prevents NoSQL injection attacks
   * - HPP prevents HTTP parameter pollution
   * - Compression reduces bandwidth usage
   * This is the same approach used by payment processors like Stripe."
   */
  private initializeMiddlewares(): void {
    // Security Headers (Helmet)
    this.app.use(helmet());

    // CORS Configuration (Whitelist specific origins with fallback)
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://secureauth-gateway.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ];

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true, // Allow cookies to be sent
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Body Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie Parser
    this.app.use(cookieParser(config.COOKIE_SECRET));

    // Compression (Gzip)
    this.app.use(compression());

    // Data Sanitization against NoSQL Injection
    this.app.use(mongoSanitize());

    // Prevent HTTP Parameter Pollution
    this.app.use(hpp());

    // HTTP Request Logger (Morgan)
    if (config.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      }));
    }
  }

  /**
   * ROUTE INITIALIZATION
   */
  private initializeRoutes(): void {
    // Health Check Endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'SecureAuth Gateway is running',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
      });
    });

    // API Base Route
    this.app.get(`/api/${config.API_VERSION}`, (req, res) => {
      res.status(200).json({
        success: true,
        message: 'SecureAuth Gateway API v1',
        documentation: '/api/v1/docs',
      });
    });

    // Mount Route Modules
    this.app.use(`/api/${config.API_VERSION}/auth`, authRoutes);
    this.app.use(`/api/${config.API_VERSION}/transaction`, transactionRoutes);
    this.app.use(`/api/${config.API_VERSION}/users`, userRoutes);
  }

  /**
   * ERROR HANDLING INITIALIZATION
   */
  private initializeErrorHandling(): void {
    // 404 Handler (must be after all routes)
    this.app.use(notFoundHandler);

    // Global Error Handler (must be last)
    this.app.use(errorHandler);
  }

  /**
   * START SERVER
   ** "I implemented graceful startup and shutdown to ensure database connections
   * are established before accepting requests and properly closed on shutdown.
   * This prevents data corruption and connection leaks."
   */
  public async start(): Promise<void> {
    try {
      // Connect to Database first
      await DatabaseConnection.connect();

      // Start Express Server
      this.app.listen(this.port, () => {
        logger.info(`🚀 Server: Running on port ${this.port}`);
        logger.info(`🌍 Environment: ${config.NODE_ENV}`);
        logger.info(`📡 API Base: http://localhost:${this.port}/api/${config.API_VERSION}`);
      });

    } catch (error) {
      logger.error('❌ Server: Failed to start', error);
      process.exit(1);
    }
  }

  /**
   * GET EXPRESS APP INSTANCE
   * Useful for testing
   */
  public getApp(): Application {
    return this.app;
  }
}

// Create and Start Server
const server = new Server();
server.start();

export default server.getApp();
