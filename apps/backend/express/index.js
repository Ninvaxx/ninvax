const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_me',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET || '', { apiVersion: '2022-11-15' });

const fs = require('fs');
const path = require('path');
const events = require('events');

const dataPath = path.join(__dirname, '..', '..', 'site', 'products.json');
const userPath = path.join(__dirname, 'users.json');
const emitter = new events.EventEmitter();
let cachedStrains = [];
// Load data on startup
loadStrains();
loadUsers();

let users = [];

function loadStrains() {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    cachedStrains = data;
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

function loadUsers() {
  try {
    const data = JSON.parse(fs.readFileSync(userPath, 'utf8'));
    users = data;
    return users;
  } catch (err) {
    console.error(err);
    users = [];
    return [];
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(userPath, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Failed to save users', err);
  }
}

// Watch file for changes and emit updates
fs.watchFile(dataPath, { interval: 1000 }, () => {
  const data = loadStrains();
  emitter.emit('update', data);
});

function requireLogin(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

function requireAdmin(req, res, next) {
  if (req.session.user && (req.session.user.isAdmin || req.session.user.isApproved)) {
    return next();
  }
  res.status(403).json({ error: 'Forbidden' });
}

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ error: 'User exists' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = { username, password: hash, isAdmin: false, isApproved: false };
  users.push(user);
  saveUsers();
  res.json({ status: 'created' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  req.session.user = { username: user.username, isAdmin: user.isAdmin, isApproved: user.isApproved };
  res.json({ status: 'ok' });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ status: 'ok' });
  });
});

app.get('/current_user', (req, res) => {
  res.json(req.session.user || null);
});

app.patch('/user', requireLogin, async (req, res) => {
  const { password, email } = req.body;
  const user = users.find(u => u.username === req.session.user.username);
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }
  if (email) {
    user.email = email;
  }
  saveUsers();
  res.json({ status: 'updated' });
});

app.delete('/user', requireLogin, (req, res) => {
  users = users.filter(u => u.username !== req.session.user.username);
  saveUsers();
  req.session.destroy(() => {
    res.json({ status: 'deleted' });
  });
});

app.post('/strains', requireLogin, (req, res) => {
  const { name, price, store } = req.body;
  if (!name || !price || !store) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const data = loadStrains();
  const existing = data.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.price = price;
    existing.store = store;
  } else {
    data.push({ name, price, store });
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  res.json({ status: 'ok' });
});

app.delete('/strains/:name', requireAdmin, (req, res) => {
  const { name } = req.params;
  let data = loadStrains();
  data = data.filter((s) => s.name.toLowerCase() !== name.toLowerCase());
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  res.json({ status: 'deleted' });
});

app.get('/products', async (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error' });
  }
});

// Endpoint to generate a Stripe Terminal connection token
app.post('/terminal/connection_token', async (req, res) => {
  try {
    const token = await stripe.terminal.connectionTokens.create();
    res.json({ secret: token.secret });
  } catch (err) {
    console.error('Failed to create connection token', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a PaymentIntent for Tap to Pay clients
app.post('/terminal/create_payment_intent', async (req, res) => {
  const { amount, currency } = req.body;
  try {
    const intent = await stripe.paymentIntents.create({ amount, currency });
    res.json({ client_secret: intent.client_secret, id: intent.id });
  } catch (err) {
    console.error('Failed to create PaymentIntent', err);
    res.status(500).json({ error: err.message });
  }
});

// Capture a previously created PaymentIntent
app.post('/terminal/capture_payment_intent', async (req, res) => {
  const { id } = req.body;
  try {
    const intent = await stripe.paymentIntents.capture(id);
    res.json({ status: intent.status });
  } catch (err) {
    console.error('Failed to capture PaymentIntent', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/strains/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();

  // Send initial data
  res.write(`data: ${JSON.stringify(cachedStrains.length ? cachedStrains : loadStrains())}\n\n`);

  const onUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  emitter.on('update', onUpdate);

  req.on('close', () => {
    emitter.off('update', onUpdate);
  });
});

app.post('/purchase', async (req, res) => {
  // Placeholder for payment intent
  res.json({});
});

// Stripe webhook handler
app.post('/webhook', (req, res) => {
  const event = req.body;

  switch (event.type) {
    case 'customer.subscription.created':
      console.log(
        `Subscription created for customer ${event.data.object.customer}`
      );
      break;
    case 'customer.deleted':
      console.log(`Customer deleted: ${event.data.object.id}`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
