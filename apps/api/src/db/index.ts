import process from 'process';
import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    logger.info('MongoDB connected');
  } catch (err: any) {
    logger.error({ err }, 'MongoDB connected');
  }
};

export { connectDB };
