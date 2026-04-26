const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { configureCloudinary } = require('../config/cloudinary');
const Part = require('../models/Part');
const { adminAuth } = require('../middleware/auth');

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

// @route   GET /api/parts
// @desc    Get all parts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const parts = await Part.find();
    const normalizedParts = parts.map((part) => ({
      ...part.toObject(),
      quantity: typeof part.quantity === 'number' && !Number.isNaN(part.quantity) ? part.quantity : part.inStock ? 1 : 0,
    }));
    res.json(normalizedParts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/parts/:id
// @desc    Get single part
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }
    res.json(part);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/parts
// @desc    Create new part
// @access  Admin
router.post('/', adminAuth, upload.single('image'), [
  body('name', 'Name is required').not().isEmpty(),
  body('category', 'Category is required').not().isEmpty(),
  body('carMake', 'Car make is required').not().isEmpty(),
  body('carModel', 'Car model is required').not().isEmpty(),
  body('year', 'Year is required').isNumeric(),
  body('price', 'Price is required').isNumeric(),
  body('condition', 'Condition is required').not().isEmpty(),
  body('quantity', 'Quantity must be a non-negative whole number').optional({ checkFalsy: true }).isInt({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Part image is required' });
  }

  const { name, category, carMake, carModel, year, price, condition, description, carSubmissionId, quantity } = req.body;

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
      folder: 'parts'
    });

    const partQuantity = quantity !== undefined ? Number(quantity) : 1;
    const part = new Part({
      name,
      category,
      carMake,
      carModel,
      year,
      price,
      condition,
      quantity: partQuantity,
      inStock: partQuantity > 0,
      image: result.secure_url,
      description,
      carSubmissionId,
    });

    await part.save();
    res.json(part);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/parts/:id
// @desc    Delete a part
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    await Part.findByIdAndDelete(req.params.id);
    res.json({ message: 'Part deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;