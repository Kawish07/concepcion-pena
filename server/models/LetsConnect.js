const mongoose = require('mongoose');

const LetsConnectSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  bestTime: { type: Date },
  timezone: { type: String, default: 'ET' }
}, { timestamps: true });

module.exports = mongoose.models.LetsConnect || mongoose.model('LetsConnect', LetsConnectSchema);
