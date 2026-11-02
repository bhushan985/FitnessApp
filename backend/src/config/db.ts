import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

const getSafeMongoDetails = (uri: string) => {
  try {
    const match = uri.match(/@([^/\?]+)(?:\/([^?\s]*))?/);
    if (match) {
      const host = match[1];
      const dbName = match[2] || 'nutriregion';
      return { host, dbName };
    }
  } catch {
    // Ignore parsing errors for safety
  }
  return { host: 'MongoDB Atlas', dbName: 'nutriregion' };
};

export const connectDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('⚠️ MONGODB_URI missing from environment. Falling back to In-Memory MongoDB server...');
    return await connectMemoryDB();
  }

  const { host, dbName } = getSafeMongoDetails(mongoUri);
  console.log(`🔄 Connecting to MongoDB (${host} / DB: ${dbName})...`);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected successfully to ${host} [DB: ${dbName}]`);
    return false; // Not in-memory fallback
  } catch (error: any) {
    console.error(`❌ MongoDB connection failed for ${host}`);

    const errorMsg = error?.message || String(error);

    if (errorMsg.includes('TLSV1_ALERT_INTERNAL_ERROR') || errorMsg.includes('SSL alert number 80')) {
      console.error('  [Category]: TLS Handshake Error (SSL Alert 80)');
      console.error('  [Primary Cause]: MongoDB Atlas Network Access (IP Whitelist) is blocking your current IP address.');
      console.error('  [Action Required]: Log into MongoDB Atlas -> Security -> Network Access -> Add Current IP Address (or 0.0.0.0/0 for testing).');
    } else if (error?.name === 'MongoParseError' || errorMsg.includes('URI')) {
      console.error('  [Category]: URI Parsing Error');
    } else if (error?.name === 'MongoServerSelectionError') {
      console.error('  [Category]: Server Selection Timeout');
      console.error('  [Action Required]: Verify internet connectivity and check if the MongoDB Atlas cluster is online.');
    } else {
      console.error('  [Category]: Database Error -', errorMsg);
    }

    console.warn('\n⚠️ Falling back to In-Memory MongoDB Server so backend API can run on port 5000...\n');
    return await connectMemoryDB();
  }
};

const connectMemoryDB = async (): Promise<boolean> => {
  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to In-Memory MongoDB Server successfully!');
    return true; // Is in-memory fallback
  } catch (memErr) {
    console.error('❌ Failed to start In-Memory MongoDB Server:', memErr);
    throw memErr;
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

