const LeaveType = require('../models/LeaveType');

// GET /api/leave-types
exports.getLeaveTypes = async (req, res) => {
  try {
    const types = await LeaveType.find().sort({ name: 1 });
    const data = types.map((t) => ({
      id: t._id,
      name: t.name,
      daysPerYear: t.daysPerYear,
      situational: t.situational,
    }));
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/leave-types
exports.addLeaveType = async (req, res) => {
  try {
    const { name, daysPerYear, situational } = req.body;
    const type = await LeaveType.create({ name, daysPerYear, situational: situational || false });
    res.status(201).json({ data: type });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
