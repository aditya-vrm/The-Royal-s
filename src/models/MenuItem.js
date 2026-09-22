const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
  {
    venue: {
      type: String,
      required: true,
      enum: ['cafe', 'restaurant'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    type: {
      type: String,
      required: true,
      enum: ['veg', 'non-veg'],
    },
    description: {
      type: String,
      default: '',
    },
    available: {
      type: Boolean,
      default: true,
    },
    isChefSpecial: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

MenuItemSchema.index({ venue: 1, category: 1, available: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
