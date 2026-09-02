import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri !== 'memory') {
      console.log('Connecting to MongoDB at:', mongoUri);
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully to external URI');
    } else {
      console.log('Initializing embedded MongoMemoryServer for zero-config local execution...');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`MongoDB connected successfully to MongoMemoryServer at ${uri}`);
    }
  } catch (error) {
    console.error('MongoDB connection error, attempting fallback to memory server:', error);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`MongoDB fallback memory server connected at ${uri}`);
    } catch (fallbackErr) {
      console.error('Failed to initialize MongoDB fallback:', fallbackErr);
      process.exit(1);
    }
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
