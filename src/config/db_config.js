import mongoose from "mongoose";

let isConnected = false;

// Log connection lifecycle once at import time so a drop/reconnect is visible
// in pm2 logs (helps diagnose "routes go dead" caused by brief DNS/network
// hiccups on Atlas).
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected — driver will auto-reconnect");
  isConnected = false;
});
mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
  isConnected = true;
});
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err?.message || err);
});

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URL, {
      // Buffer commands briefly while the driver is reconnecting, instead of
      // rejecting every query the moment the socket drops. Atlas SRV DNS
      // hiccups used to make every route fail instantly — now they wait.
      bufferCommands: true,
      bufferTimeoutMS: 10_000,
      autoIndex: false,
      // Give SRV/DNS resolution a realistic window before giving up.
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      // Pool tuning — keep some idle connections so we don't renegotiate on
      // every request.
      maxPoolSize: 20,
      minPoolSize: 2,
      heartbeatFrequencyMS: 10_000,
      // Let the Node driver retry reads and writes across transient errors.
      retryWrites: true,
      retryReads: true,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("ℹ️ MongoDB connection closed");
  } catch (error) {
    console.error("❌ Failed to disconnect MongoDB:", error.message);
  }
};

export default connectDB;
export { disconnectDB };
