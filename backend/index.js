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

app.get('/products', async (req, res) => {
  // Placeholder for product list
  res.json([]);
});

app.post('/purchase', async (req, res) => {
  // Placeholder for payment intent
  res.json({});
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
