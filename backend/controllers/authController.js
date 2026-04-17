const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, employeeId, department, jobTitle, supervisor, team } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (await User.findOne({ employeeId })) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    const user = await User.create({
      employeeId,
      firstName,
      lastName,
      email,
      password,
      role: role || 'Employee',
      department: department || '',
      jobTitle: jobTitle || '',
      supervisor: supervisor || '',
      team: team || '',
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user.employeeId,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Validate role is provided and matches user's actual role
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    if (user.role !== role) {
      return res.status(403).json({ message: 'Invalid role for this user' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user.employeeId,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({
    id: req.user.employeeId,
    _id: req.user._id,
    employeeId: req.user.employeeId,
    name: req.user.name,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role,
    avatar: req.user.avatar,
    jobTitle: req.user.jobTitle,
    department: req.user.department,
    supervisor: req.user.supervisor,
    employmentStatus: req.user.employmentStatus,
    joinDate: req.user.joinDate,
    team: req.user.team,
    profileImage: req.user.profileImage,
  });
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Since we are skipping OTP/email links for now, we just indicate success
    res.json({ message: 'Email found. Proceed to reset password.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // The User model has a pre-save hook that hashes the password if modified.
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
