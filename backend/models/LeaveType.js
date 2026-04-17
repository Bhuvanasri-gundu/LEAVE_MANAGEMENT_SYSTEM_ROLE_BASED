const mongoose = require('mongoose');

/**
 * LeaveType Schema
 * Configurable leave policies (Admin-managed).
 * 
 * Matches frontend leaveTypes.json:
 *   id, name, daysPerYear, situational
 */
const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Leave type name is required'],
      unique: true,
      trim: true,
    },
    daysPerYear: {
      type: Number,
      required: [true, 'Days per year is required'],
    },
    situational: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
