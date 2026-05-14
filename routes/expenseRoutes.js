const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Expense = require('../models/Expense');

// GET /api/expenses - fetch all expenses for user
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/expenses - add expense
router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    if (!title || amount == null || !category) return res.status(400).json({ message: 'Missing fields' });

    const expense = new Expense({
      userId: req.user.id,
      title,
      amount,
      category,
      date: date || Date.now(),
    });
    await expense.save();
    res.json({ expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/expenses/:id - delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await expense.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
