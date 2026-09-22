const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['waiter', 'captain', 'chef', 'admin'],
      default: 'waiter',
    },
    pin: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
