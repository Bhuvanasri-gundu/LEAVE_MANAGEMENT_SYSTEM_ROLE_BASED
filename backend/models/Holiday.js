const mongoose = require('mongoose');

/**
 * Holiday Schema
 * Company holidays (Admin-managed).
 * 
 * Matches frontend holidays.json:
 *   id, name, date, recurring, length
 */
const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Holiday name is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Holiday date is required'],
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    length: {
      type: String,
      enum: ['Full Day', 'Half Day'],
      default: 'Full Day',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Holiday', holidaySchema);
