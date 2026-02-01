import process from 'process';
import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Connection options for better reliability
    await mongoose.connect(uri, {
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket operations
    });

    logger.info('✅ MongoDB connected');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed');
    throw err; // Re-throw to let the caller handle it
  }
};

export { connectDB };
