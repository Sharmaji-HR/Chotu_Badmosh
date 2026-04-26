const express = require('express');
const { body, validationResult } = require('express-validator');
const Part = require('../models/Part');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post(
  '/',
  auth,
  [
    body('items', 'Order items are required').isArray({ min: 1 }),
    body('paymentMethod', 'Payment method is required').not().isEmpty(),
    body('shippingAddress.fullName', 'Full name is required').not().isEmpty(),
    body('shippingAddress.phone', 'Phone number is required').not().isEmpty(),
    body('shippingAddress.street', 'Street address is required').not().isEmpty(),
    body('shippingAddress.city', 'City is required').not().isEmpty(),
    body('shippingAddress.state', 'State is required').not().isEmpty(),
    body('shippingAddress.postalCode', 'Postal code is required').not().isEmpty(),
    body('shippingAddress.country', 'Country is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, paymentMethod, shippingAddress } = req.body;

    if (paymentMethod !== 'COD') {
      return res.status(400).json({ message: 'Only Cash on Delivery is supported.' });
    }

    try {
      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const part = await Part.findById(item.partId);
        if (!part) {
          return res.status(404).json({ message: `Part not found: ${item.partId}` });
        }

        const quantity = Number(item.quantity || 1);
        if (quantity < 1) {
          return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const availableQuantity = typeof part.quantity === 'number' && !Number.isNaN(part.quantity)
          ? part.quantity
          : part.inStock ? 1 : 0;

        if (!part.inStock || availableQuantity < quantity) {
          return res.status(400).json({ message: `Not enough stock for ${part.name}` });
        }

        part.quantity = availableQuantity - quantity;
        part.inStock = part.quantity > 0;
        await part.save();

        orderItems.push({
          part: part._id,
          name: part.name,
          price: part.price,
          quantity,
          image: part.image,
        });

        total += part.price * quantity;
      }

      const order = new Order({
        user: req.user.id,
        items: orderItems,
        total,
        paymentMethod,
        shippingAddress,
      });

      await order.save();

      res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET /api/orders/my
// @desc    Get current user orders
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
