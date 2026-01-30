/* eslint-disable no-undef */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    // Use MongoDB Atlas for both development and production
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    mongoose.set('autoIndex', false);  // Disable automatic index creation globally

    await mongoose.connect(mongoUri);
    console.log('MongoDB Atlas connected successfully');

    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const disconnectFromDatabase = async () => {
  await mongoose.disconnect();
  isConnected = false;
};

export default mongoose;
