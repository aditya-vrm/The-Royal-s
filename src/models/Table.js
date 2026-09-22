const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
    },
    venue: {
      type: String,
      enum: ['cafe', 'restaurant', 'both'],
      default: 'both',
    },
    section: {
      type: String,
      default: 'Main Dining',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Table || mongoose.model('Table', TableSchema);
