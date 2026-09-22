const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['cafe', 'restaurant'],
    },
    name: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    heroImage: {
      type: String,
      required: true,
    },
    theme: {
      accentColor: { type: String, default: '#D4AF37' },
      secondaryBg: { type: String, default: '#1A1A1C' },
      badgeColor: { type: String, default: '#2A1810' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Venue || mongoose.model('Venue', VenueSchema);
