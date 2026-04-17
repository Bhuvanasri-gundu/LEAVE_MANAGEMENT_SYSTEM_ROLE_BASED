const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: true, // e.g. "EMP-001" for frontend compatibility
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
    },
    fromDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    toDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Taken', 'Scheduled'],
      default: 'Pending',
    },
    comments: {
      type: String,
      default: '',
    },
    managerComment: {
      type: String,
      default: '',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    // Document verification (independent of leave approval) - stores full URL as string
    document: mongoose.Schema.Types.Mixed,
    documentStatus: {
      type: String,
      enum: ['None', 'Pending', 'Verified', 'Rejected'],
      default: 'None',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    subUnit: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Leave', leaveSchema);
