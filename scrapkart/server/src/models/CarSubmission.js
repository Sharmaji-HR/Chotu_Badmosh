const mongoose = require('mongoose');

const carSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  mileage: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'not-running'],
    required: true,
  },
  description: String,
  expectedPrice: {
    type: Number,
    required: true,
  },
  estimatedPrice: {
    type: Number,
    required: true,
  },
  carImage: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote: String,
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: Date,
});

module.exports = mongoose.model('CarSubmission', carSubmissionSchema);