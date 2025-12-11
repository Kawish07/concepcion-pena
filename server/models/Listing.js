const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  address: { type: String, default: '' },
  price: { type: Number, default: 0 },
  beds: { type: Number, default: 0 },
  baths: { type: Number, default: 0 },
  // living area in square feet
  livingArea: { type: Number, default: 0 },
  // raw sqft string kept for compatibility
  sqft: { type: String, default: '' },
  status: { type: String, default: 'active' },
  // support multiple main images
  images: { type: [String], default: [] },
  description: { type: String, default: '' },
  // lot size or area (e.g., "5,000 Sq.Ft.")
  lotSize: { type: String, default: '' },
  mls: { type: String, default: '' },
  agent: { type: String, default: '' },
  agentPhoto: { type: String, default: '' },
  // whether to show a Request Info button
  requestInfo: { type: Boolean, default: true },
  // additional fields shown in the Features & Amenities section
  features: { type: String, default: '' },
  amenities: { type: String, default: '' },
  totalBedrooms: { type: Number, default: 0 },
  totalBathrooms: { type: Number, default: 0 },
  fullBathrooms: { type: Number, default: 0 },
  threeQuarterBathrooms: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
