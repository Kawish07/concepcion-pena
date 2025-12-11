const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Listing = require('./models/Listing');
const Contact = require('./models/Contact');
const LetsConnect = require('./models/LetsConnect');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());

// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realestate';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err));

// Routes
app.get('/api/listings', async (req, res) => {
  const listings = await Listing.find().sort({ createdAt: -1 });
  res.json(listings);
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    res.json(listing);
  } catch (e) {
    res.status(400).json({ error: 'Invalid id' });
  }
});

app.post('/api/listings', upload.fields([{ name: 'imageFiles', maxCount: 20 }, { name: 'imageFiles[]', maxCount: 20 }, { name: 'agentPhotoFile', maxCount: 1 }]), async (req, res) => {
  try {
    const data = req.body || {};
    if (req.files) {
      const imgs = [];
      if (req.files.imageFiles && req.files.imageFiles.length) imgs.push(...req.files.imageFiles);
      if (req.files['imageFiles[]'] && req.files['imageFiles[]'].length) imgs.push(...req.files['imageFiles[]']);
      if (imgs.length) {
        data.images = imgs.map(f => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`);
      }
      if (req.files.agentPhotoFile && req.files.agentPhotoFile[0]) {
        data.agentPhoto = `${req.protocol}://${req.get('host')}/uploads/${req.files.agentPhotoFile[0].filename}`;
      }
    }
    // convert numeric fields if present
    if (data.price) data.price = Number(data.price);
    if (data.beds) data.beds = Number(data.beds);
    if (data.baths) data.baths = Number(data.baths);
    if (data.livingArea) data.livingArea = Number(data.livingArea);
    const created = await Listing.create(data);
    res.status(201).json(created);
  } catch (e) {
    console.error('Create listing error', e);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

app.put('/api/listings/:id', upload.fields([{ name: 'imageFiles', maxCount: 20 }, { name: 'imageFiles[]', maxCount: 20 }, { name: 'agentPhotoFile', maxCount: 1 }]), async (req, res) => {
  try {
    const data = req.body || {};
    if (req.files) {
      const imgs = [];
      if (req.files.imageFiles && req.files.imageFiles.length) imgs.push(...req.files.imageFiles);
      if (req.files['imageFiles[]'] && req.files['imageFiles[]'].length) imgs.push(...req.files['imageFiles[]']);
      if (imgs.length) {
        data.images = imgs.map(f => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`);
      }
      if (req.files.agentPhotoFile && req.files.agentPhotoFile[0]) {
        data.agentPhoto = `${req.protocol}://${req.get('host')}/uploads/${req.files.agentPhotoFile[0].filename}`;
      }
    }
    if (data.price) data.price = Number(data.price);
    if (data.beds) data.beds = Number(data.beds);
    if (data.baths) data.baths = Number(data.baths);
    if (data.livingArea) data.livingArea = Number(data.livingArea);
    const updated = await Listing.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (e) {
    console.error('Update listing error', e);
    res.status(400).json({ error: 'Invalid id' });
  }
});

app.delete('/api/listings/:id', async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Invalid id' });
  }
});

// Contact endpoints
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: 'Missing required fields' });
    const created = await Contact.create({ name, email, phone: phone || '' });
    res.status(201).json(created);
  } catch (e) {
    console.error('Create contact error', e);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// LetsConnect endpoints
app.post('/api/letsconnect', async (req, res) => {
  try {
    const { name, email, phone, bestTime, timezone } = req.body || {};
    if (!name || !email || !bestTime) return res.status(400).json({ error: 'Missing required fields' });
    const bt = bestTime ? new Date(bestTime) : null;
    const created = await LetsConnect.create({ name, email, phone: phone || '', bestTime: bt, timezone: timezone || 'ET' });
    res.status(201).json(created);
  } catch (e) {
    console.error('Create letsconnect error', e);
    res.status(500).json({ error: 'Failed to create letsconnect' });
  }
});

app.get('/api/letsconnect', async (req, res) => {
  try {
    const list = await LetsConnect.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    console.error('List letsconnect error', e);
    res.status(500).json({ error: 'Failed to list letsconnect' });
  }
});

app.get('/api/contact', async (req, res) => {
  try {
    const list = await Contact.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    console.error('List contact error', e);
    res.status(500).json({ error: 'Failed to list contacts' });
  }
});

// Admin signup/login
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

app.post('/api/admin/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing required fields' });
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const created = await Admin.create({ email: email.toLowerCase(), passwordHash: hash, name: name || '' });
    const token = jwt.sign({ id: created._id, email: created.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, admin: { id: created._id, email: created.email, name: created.name } });
  } catch (e) {
    console.error('Admin signup error', e);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing required fields' });
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
  } catch (e) {
    console.error('Admin login error', e);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// simple middleware to verify token
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const m = auth.match(/^Bearer\s+(.*)$/i);
  if (!m) return res.status(401).json({ error: 'Unauthorized' });
  const token = m[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

app.get('/api/admin/me', verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-passwordHash');
    if (!admin) return res.status(404).json({ error: 'Not found' });
    res.json({ admin });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch admin' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
