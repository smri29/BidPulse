const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Pool size and timeout values are environment-driven so deployments can tune DB behavior.
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Fail fast if the API cannot reach its primary datastore.
  }
};

module.exports = connectDB;
