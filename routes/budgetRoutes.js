const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/budget - get user's budget
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('budget');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ budget: user.budget });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/budget - set/update budget
router.post('/', auth, async (req, res) => {
  try {
    const { budget } = req.body;
    if (budget == null) return res.status(400).json({ message: 'Budget is required' });

    const user = await User.findByIdAndUpdate(req.user.id, { budget }, { new: true }).select('budget');
    res.json({ budget: user.budget });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
