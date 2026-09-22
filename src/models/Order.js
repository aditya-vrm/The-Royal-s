const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  type: {
    type: String,
    enum: ['veg', 'non-veg'],
    default: 'veg',
  },
  notes: {
    type: String,
    default: '',
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    table: {
      type: Number,
      required: true,
    },
    venue: {
      type: String,
      required: true,
      enum: ['cafe', 'restaurant'],
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    guestPhone: {
      type: String,
      default: '',
    },
    specialInstructions: {
      type: String,
      default: '',
    },
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'served', 'cancelled'],
      default: 'pending',
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    confirmedBy: {
      type: String,
      default: null,
    },
    servedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto generate friendly order number e.g. #ROY-1042
OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ROY-${randomSuffix}`;
  }
  next();
});

OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ table: 1, status: 1 });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
