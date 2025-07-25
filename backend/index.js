const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET || '', { apiVersion: '2022-11-15' });

const fs = require('fs');
const path = require('path');

app.get('/products', async (req, res) => {
  const dataPath = path.join(__dirname, '..', 'site', 'strains.json');
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error' });
  }
});

app.post('/purchase', async (req, res) => {
  // Placeholder for payment intent
  res.json({});
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
