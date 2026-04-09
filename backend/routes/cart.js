const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Plant = require('../models/Plant');

const router = express.Router();

async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const parts = authHeader.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid token' });
  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET || 'secret');
    const u = await User.findById(payload.id);
    if (!u || u.isBlocked) return res.status(403).json({ error: 'Account blocked or not found' });
    req.user = u;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.use(auth);

// Utility to safely get plant ID regardless of population
const getPlantId = (p) => {
  if (!p) return null;
  return p._id ? p._id.toString() : p.toString();
};

router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.plant');
    if (!cart) {
        cart = await Cart.create({ 
            user: req.user.id,
            userName: req.user.name,
            userEmail: req.user.email,
            items: [] 
        });
    }
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update/Add single item
router.post('/', async (req, res) => {
  try {
    const { plantId, qty = 1, isAbsolute = false } = req.body;
    if (!plantId) return res.status(400).json({ error: 'plantId required' });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ 
        user: req.user.id, 
        userName: req.user.name, 
        userEmail: req.user.email,
        items: [] 
      });
    } else {
      cart.userName = req.user.name;
      cart.userEmail = req.user.email;
    }

    const index = cart.items.findIndex((it) => getPlantId(it.plant) === plantId.toString());
    if (index > -1) {
      if (isAbsolute) cart.items[index].qty = qty;
      else cart.items[index].qty = Math.max(1, cart.items[index].qty + qty);
    } else {
      cart.items.push({ plant: plantId, qty });
    }

    cart.updatedAt = new Date();
    await cart.save();
    res.json(await cart.populate('items.plant'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sync batch items (from localStorage to DB)
router.post('/sync', async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, qty }
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ 
        user: req.user.id, 
        userName: req.user.name, 
        userEmail: req.user.email,
        items: [] 
      });
    } else {
      cart.userName = req.user.name;
      cart.userEmail = req.user.email;
    }

    for (const entry of items) {
      const index = cart.items.findIndex(it => getPlantId(it.plant) === entry.id.toString());
      if (index > -1) {
        cart.items[index].qty += entry.qty;
      } else {
        cart.items.push({ plant: entry.id, qty: entry.qty });
      }
    }

    cart.updatedAt = new Date();
    await cart.save();
    res.json(await cart.populate('items.plant'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove single item completely
router.delete('/:plantId', async (req, res) => {
  try {
    const { plantId } = req.params;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    
    cart.items = cart.items.filter((it) => getPlantId(it.plant) !== plantId.toString());
    cart.updatedAt = new Date();
    await cart.save();
    res.json(await cart.populate('items.plant'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear all items
router.delete('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date();
      await cart.save();
    }
    res.json({ ok: true, items: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
