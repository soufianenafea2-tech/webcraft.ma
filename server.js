const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 Khtar l-mot de passe dyal l-Admin
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// ─── CONNECT TO MONGODB ───────────────────────────────
// (Hada l-lien li ghadi t-jib mn MongoDB Atlas)
const MONGO_URI = process.env.MONGO_URI || "L-LIEN-DYALEK-HNA";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Schema dyal l-demandes
const RequestSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  siteType: String,
  budget: String,
  features: [String],
  description: String,
  status: { type: String, default: 'nouveau' },
  createdAt: { type: Date, default: Date.now }
});

const Request = mongoose.model('Request', RequestSchema);

// ─── MIDDLEWARE ────────────────────────────────────────
app.use(express.json());
app.use(express.static(__dirname));

function requireAuth(req, res, next) {
  if (req.headers.authorization === `Bearer ${ADMIN_PASSWORD}`) return next();
  res.status(401).json({ error: 'Non autorisé' });
}

// ─── ROUTES ───────────────────────────────────────────

app.post('/api/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) res.json({ success: true, token: ADMIN_PASSWORD });
  else res.status(401).json({ error: 'Incorrect' });
});

app.get('/api/requests', requireAuth, async (req, res) => {
  const data = await Request.find().sort({ createdAt: -1 });
  res.json(data);
});

app.post('/api/requests', async (req, res) => {
  try {
    const newReq = new Request(req.body);
    await newReq.save();
    res.status(201).json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/requests/:id', requireAuth, async (req, res) => {
  await Request.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json({ success: true });
});

app.delete('/api/requests/:id', requireAuth, async (req, res) => {
  await Request.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 Port: ${PORT}`));