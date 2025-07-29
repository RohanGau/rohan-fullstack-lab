import process from 'process';
import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    logger.info('MongoDB connected');
  } catch (err: any) {
    logger.error({ err }, 'MongoDB connection failed - Exiting process', process.env.MONGODB_URI);
  }
};

export { connectDB };
