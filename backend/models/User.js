const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Maps to: Admin, Manager, Employee roles
 * 
 * Fields match what the frontend AuthContext expects:
 *   - id (virtual from _id), name, email, role, avatar
 * Plus extra fields the frontend employee list uses:
 *   - firstName, lastName, jobTitle, department, etc.
 */
const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,   // e.g. "EMP-001"
      trim: true,
      sparse: true,   // Allow null for auto-generation during pre-save
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    middleName: {
      type: String,
      default: '',
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['Admin', 'Manager', 'Employee'],
      default: 'Employee',
    },
    jobTitle: {
      type: String,
      default: '',
    },
    employmentStatus: {
      type: String,
      enum: ['Full-Time Permanent', 'Full-Time Contract', 'Part-Time', 'Intern', 'Freelance', 'Probation'],
      default: 'Full-Time Permanent',
    },
    department: {
      type: String,
      default: '',
    },
    supervisor: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    team: {
      type: String,
      default: '',
    },
    subUnit: {
      type: String,
      required: [true, 'Department (subUnit) is required'],
      default: 'Engineering',
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// ------- Virtual: full name -------
userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ------- Virtual: avatar initials -------
userSchema.virtual('avatar').get(function () {
  return `${this.firstName[0]}${this.lastName[0]}`;
});

// Include virtuals in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// ------- Auto-generate employeeId and hash password before saving -------
userSchema.pre('save', async function () {
  // Auto-generate employeeId if not provided
  if (!this.employeeId) {
    const lastEmployee = await this.constructor.findOne().sort({ employeeId: -1 });
    let nextNum = 1;
    if (lastEmployee && lastEmployee.employeeId) {
      const match = lastEmployee.employeeId.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }
    this.employeeId = `EMP-${String(nextNum).padStart(3, '0')}`;
  }

  // Hash password if modified
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ------- Method: compare entered password with hashed -------
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
