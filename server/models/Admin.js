const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
