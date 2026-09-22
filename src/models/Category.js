const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    venue: {
      type: String,
      required: true,
      enum: ['cafe', 'restaurant'],
    },
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'Utensils',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

CategorySchema.index({ venue: 1, sortOrder: 1 });

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
