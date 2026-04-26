const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = (process.env.MONGODB_URI || '').trim();

  if (!mongoUri) {
    console.error('MONGODB_URI is missing. Set it in your environment before starting the server.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    if (error && error.code === 8000) {
      console.error('MongoDB authentication failed (AtlasError 8000). Check username/password in MONGODB_URI and ensure special characters are URL-encoded.');
    }

    console.error('MongoDB connection error:', error.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;