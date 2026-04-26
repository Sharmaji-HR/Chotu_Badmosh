const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { configureCloudinary } = require('../config/cloudinary');
const CarSubmission = require('../models/CarSubmission');
const { auth, adminAuth } = require('../middleware/auth');

const cloudinary = configureCloudinary();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

const router = express.Router();

// @route   GET /api/cars
// @desc    Get all submissions
// @access  Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const submissions = await CarSubmission.find().populate('userId', 'name email');
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/cars/user/:userId
// @desc    Get user's submissions
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const submissions = await CarSubmission.find({ userId: req.params.userId });
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/cars
// @desc    Submit new car
// @access  Private
router.post('/', auth, upload.single('carImage'), [
  body('make', 'Make is required').not().isEmpty(),
  body('model', 'Model is required').not().isEmpty(),
  body('year', 'Year is required').isNumeric(),
  body('mileage', 'Mileage is required').isNumeric(),
  body('condition', 'Condition is required').isIn(['excellent', 'good', 'fair', 'poor', 'not-running']),
  body('expectedPrice', 'Expected price is required').isNumeric(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Car image is required' });
  }

  const { make, model, year, mileage, condition, description, expectedPrice } = req.body;

  // Simple price estimation logic
  let basePrice = 5000;
  if (year > 2015) basePrice += 2000;
  if (mileage < 50000) basePrice += 1000;
  const conditionMultiplier = { excellent: 1.5, good: 1.2, fair: 1.0, poor: 0.8, 'not-running': 0.5 };
  const estimatedPrice = Math.round(basePrice * conditionMultiplier[condition]);

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
      folder: 'car_submissions'
    });

    const submission = new CarSubmission({
      userId: req.user.id,
      make,
      model,
      year,
      mileage,
      condition,
      description,
      expectedPrice,
      estimatedPrice,
      carImage: result.secure_url,
    });

    await submission.save();
    res.json(submission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/cars/:id/approve
// @desc    Approve submission
// @access  Admin
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const submission = await CarSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    submission.status = 'approved';
    submission.adminNote = req.body.adminNote || '';
    submission.reviewedAt = new Date();
    await submission.save();
    res.json(submission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/cars/:id/reject
// @desc    Reject submission
// @access  Admin
router.put('/:id/reject', adminAuth, async (req, res) => {
  try {
    const submission = await CarSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    submission.status = 'rejected';
    submission.adminNote = req.body.adminNote || '';
    submission.reviewedAt = new Date();
    await submission.save();
    res.json(submission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/cars/:id
// @desc    Delete a car submission
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const submission = await CarSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    await submission.deleteOne();
    res.json({ message: 'Submission deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;