import mongoose from "mongoose";

const globalWithMongo = global as typeof globalThis & {
  mongoConnected?: boolean;
};

export async function connectMongo() {
  if (globalWithMongo.mongoConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    globalWithMongo.mongoConnected = true;
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Error:", err);
    throw err;
  }
}
