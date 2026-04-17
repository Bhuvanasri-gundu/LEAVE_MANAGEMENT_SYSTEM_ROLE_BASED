const Holiday = require('../models/Holiday');

// GET /api/holidays
exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    const data = holidays.map((h) => ({
      id: h._id,
      name: h.name,
      date: h.date.toISOString().split('T')[0],
      recurring: h.recurring,
      length: h.length,
    }));
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/holidays
exports.addHoliday = async (req, res) => {
  try {
    const { name, date, recurring, length } = req.body;
    const holiday = await Holiday.create({ name, date, recurring: recurring || false, length: length || 'Full Day' });
    res.status(201).json({ data: holiday });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
