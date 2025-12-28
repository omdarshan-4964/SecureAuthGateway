import mongoose from 'mongoose';
import config from './index';
import logger from '@/utils/logger';

/**
 * DATABASE CONNECTION MANAGER
 ** "I implemented a singleton pattern for database connections to prevent connection pool exhaustion.
 * The connection is established once and reused throughout the application lifecycle,
 * which is crucial for horizontal scaling in production."
 */

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Establish MongoDB Connection
   * Uses Mongoose with optimized connection pooling for production
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('📦 MongoDB: Already connected');
      return;
    }

    try {
      // Mongoose Connection Options (Production-Grade)
      const options = {
        maxPoolSize: 10, // Maximum number of connections in the pool
        minPoolSize: 5,  // Minimum number of connections
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        serverSelectionTimeoutMS: 5000, // Timeout for selecting a server
        heartbeatFrequencyMS: 10000, // Check server health every 10 seconds
      };

      await mongoose.connect(config.MONGODB_URI, options);

      this.isConnected = true;
      logger.info('✅ MongoDB: Connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        logger.error('❌ MongoDB: Connection error', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️  MongoDB: Disconnected');
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      logger.error('❌ MongoDB: Failed to connect', error);
      throw error;
    }
  }

  /**
   * Graceful Disconnect
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info('🔌 MongoDB: Disconnected gracefully');
    } catch (error) {
      logger.error('❌ MongoDB: Error during disconnect', error);
      throw error;
    }
  }

  /**
   * Get Connection Status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export default DatabaseConnection.getInstance();
