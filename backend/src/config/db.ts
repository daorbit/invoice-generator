import mongoose from 'mongoose';
import { env } from './env.js';

let pending: Promise<typeof mongoose> | null = null;

const CONNECTED = 1;
const DISCONNECTED = 0;

export function connectDb() {
  if (!env.mongodbUri) {
    console.warn('MONGODB_URI not set, skipping db connection');
    return Promise.resolve(null);
  }

  if (mongoose.connection.readyState === CONNECTED) return Promise.resolve(mongoose);

  if (!pending || mongoose.connection.readyState === DISCONNECTED) {
    pending = mongoose
      .connect(env.mongodbUri, { serverSelectionTimeoutMS: 10_000 })
      .catch((error) => {
        pending = null;
        throw error;
      });
  }

  return pending;
}
