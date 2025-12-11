const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
