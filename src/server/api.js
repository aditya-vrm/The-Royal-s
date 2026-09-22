const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Order = require('../models/Order');
const Staff = require('../models/Staff');

// Common search synonyms for seamless search matching
const SYNONYMS = {
  momo: ['momo', 'momos', 'dimsum', 'dumpling', 'bao', 'sui mai'],
  momos: ['momo', 'momos', 'dimsum', 'dumpling', 'bao', 'sui mai'],
  dimsum: ['dimsum', 'momo', 'momos', 'dumpling', 'sui mai', 'bao'],
  dimsums: ['dimsum', 'momo', 'momos', 'dumpling', 'sui mai', 'bao'],
  dumpling: ['dumpling', 'dimsum', 'momo', 'momos', 'sui mai'],
  dumplings: ['dumpling', 'dimsum', 'momo', 'momos', 'sui mai'],
  chai: ['chai', 'tea', 'kahwa'],
  tea: ['tea', 'chai', 'kahwa'],
  coffee: ['coffee', 'latte', 'cappuccino', 'cold brew', 'macchiato', 'espresso', 'flat white'],
  chowmein: ['noodles', 'chowmein', 'hakka', 'wok'],
  noodle: ['noodles', 'chowmein', 'hakka', 'schezwan'],
  noodles: ['noodles', 'chowmein', 'hakka', 'schezwan'],
  roti: ['roti', 'naan', 'paratha', 'kulcha', 'bread'],
  bread: ['roti', 'naan', 'paratha', 'kulcha', 'bread'],
  breads: ['roti', 'naan', 'paratha', 'kulcha', 'bread'],
  biryani: ['biryani', 'pulao', 'rice'],
  biriyani: ['biryani', 'pulao', 'rice'],
  paneer: ['paneer', 'cottage cheese'],
  drink: ['lassi', 'chaas', 'mojito', 'soda', 'coffee', 'shake', 'beverage', 'milk'],
  drinks: ['lassi', 'chaas', 'mojito', 'soda', 'coffee', 'shake', 'beverage', 'milk'],
  sweet: ['mithai', 'gulab jamun', 'rasmalai', 'halwa', 'phirni', 'dessert', 'brownie', 'kulfi', 'ice cream'],
  sweets: ['mithai', 'gulab jamun', 'rasmalai', 'halwa', 'phirni', 'dessert', 'brownie', 'kulfi', 'ice cream'],
  dessert: ['dessert', 'gulab jamun', 'rasmalai', 'halwa', 'phirni', 'mithai', 'brownie', 'kulfi'],
  desserts: ['dessert', 'gulab jamun', 'rasmalai', 'halwa', 'phirni', 'mithai', 'brownie', 'kulfi'],
  kebab: ['kebab', 'kabab', 'tikka', 'tandoori', 'seekh'],
  kabab: ['kebab', 'kabab', 'tikka', 'tandoori', 'seekh'],
  kebabs: ['kebab', 'kabab', 'tikka', 'tandoori', 'seekh'],
  tikka: ['tikka', 'kebab', 'kabab', 'tandoori'],
  pizza: ['pizza', 'margherita', 'farmhouse'],
  burger: ['burger', 'burgers', 'patty'],
  pasta: ['pasta', 'fettuccine', 'penne', 'arrabbiata'],
  soup: ['soup', 'shorba', 'manchow', 'hot and sour', 'sweet corn'],
};

module.exports = function (io) {
  // Simple in-memory cache for menu responses (30s TTL)
  const menuCache = new Map();
  const CACHE_TTL_MS = 30 * 1000;

  function getCache(key) {
    const cached = menuCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    return null;
  }

  function setCache(key, data) {
    menuCache.set(key, { data, timestamp: Date.now() });
  }

  // GET /api/venues
  router.get('/venues', async (req, res) => {
    try {
      const venues = await Venue.find().lean();
      res.json({ success: true, venues });
    } catch (err) {
      console.error('Error fetching venues:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch venues' });
    }
  });

  // GET /api/menu
  router.get('/menu', async (req, res) => {
    try {
      const { venue = 'cafe', category, type, search } = req.query;
      const cleanSearch = (search || '').trim().toLowerCase();
      const cacheKey = `${venue}_${category || ''}_${type || ''}_${cleanSearch}`;

      const cached = getCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Fetch categories for this venue
      const categories = await Category.find({ venue }).sort({ sortOrder: 1 }).lean();

      // Build menu item query
      const query = { venue, available: true };

      if (category && category !== 'all') {
        query.category = category;
      }

      if (type && (type === 'veg' || type === 'non-veg')) {
        query.type = type;
      }

      if (cleanSearch) {
        // Collect search terms including synonyms
        const searchTerms = [cleanSearch];
        if (SYNONYMS[cleanSearch]) {
          searchTerms.push(...SYNONYMS[cleanSearch]);
        }

        // Also check if any category name matches the search keyword
        const matchingCatIds = categories
          .filter((cat) =>
            searchTerms.some(
              (term) =>
                cat.name.toLowerCase().includes(term) ||
                term.includes(cat.name.toLowerCase())
            )
          )
          .map((cat) => cat._id);

        const orClauses = [];
        searchTerms.forEach((term) => {
          orClauses.push({ name: { $regex: term, $options: 'i' } });
          orClauses.push({ description: { $regex: term, $options: 'i' } });
        });

        if (matchingCatIds.length > 0) {
          orClauses.push({ category: { $in: matchingCatIds } });
        }

        query.$or = orClauses;
      }

      const items = await MenuItem.find(query)
        .populate('category', 'name icon sortOrder')
        .sort({ isChefSpecial: -1, sortOrder: 1 })
        .lean();

      const responsePayload = {
        success: true,
        venue,
        categories,
        items,
        total: items.length,
      };

      setCache(cacheKey, responsePayload);
      res.json(responsePayload);
    } catch (err) {
      console.error('Error fetching menu:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch menu items' });
    }
  });

  // GET /api/tables/:qrToken
  router.get('/tables/:qrToken', async (req, res) => {
    try {
      const { qrToken } = req.params;
      const table = await Table.findOne({ qrToken, isActive: true }).lean();
      if (!table) {
        return res.status(404).json({ success: false, error: 'Table not found or inactive' });
      }
      res.json({ success: true, table });
    } catch (err) {
      console.error('Error resolving table:', err);
      res.status(500).json({ success: false, error: 'Failed to resolve table' });
    }
  });

  // GET /api/tables
  router.get('/tables', async (req, res) => {
    try {
      const tables = await Table.find().sort({ number: 1 }).lean();
      res.json({ success: true, tables });
    } catch (err) {
      console.error('Error fetching tables:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch tables' });
    }
  });

  // POST /api/orders
  router.post('/orders', async (req, res) => {
    try {
      const { table, venue, guestName, guestPhone, specialInstructions, items } = req.body;

      if (!table || !venue || !items || !items.length) {
        return res.status(400).json({
          success: false,
          error: 'Please select a table and at least one item.',
        });
      }

      const cleanGuestName = (guestName || '').trim() || `Guest (Table ${table})`;

      // Calculate subtotal
      let subtotal = 0;
      const parsedItems = items.map((item) => {
        const itemPrice = Number(item.price);
        const itemQty = Number(item.qty) || 1;
        subtotal += itemPrice * itemQty;
        return {
          menuItem: item.menuItem || item._id,
          name: item.name,
          price: itemPrice,
          qty: itemQty,
          type: item.type || 'veg',
          notes: item.notes || '',
        };
      });

      const total = subtotal;

      const newOrder = new Order({
        table: Number(table),
        venue,
        guestName: cleanGuestName,
        guestPhone: (guestPhone || '').trim(),
        specialInstructions: (specialInstructions || '').trim(),
        items: parsedItems,
        subtotal,
        total,
        status: 'pending',
      });

      await newOrder.save();

      // Emit realtime Socket.IO event to staff and table room
      if (io) {
        console.log(`🔔 [Socket.IO] New order Table #${newOrder.table} (${newOrder.orderNumber})`);
        io.to('staff').emit('order:new', newOrder);
        io.to(`table-${newOrder.table}`).emit('order:status', newOrder);
        io.to(`order-${newOrder._id}`).emit('order:status', newOrder);
      }

      res.status(201).json({ success: true, order: newOrder });
    } catch (err) {
      console.error('Error creating order:', err);
      res.status(500).json({ success: false, error: 'Failed to place order' });
    }
  });

  // GET /api/orders/:id
  router.get('/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id).lean();
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      res.json({ success: true, order });
    } catch (err) {
      console.error('Error fetching order:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
  });

  // GET /api/staff/orders
  router.get('/staff/orders', async (req, res) => {
    try {
      const { status, venue, limit = 50 } = req.query;
      const query = {};

      if (status && status !== 'all') {
        query.status = status;
      }

      if (venue && (venue === 'cafe' || venue === 'restaurant')) {
        query.venue = venue;
      }

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

      res.json({ success: true, orders });
    } catch (err) {
      console.error('Error fetching staff orders:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch staff orders' });
    }
  });

  // PATCH /api/staff/orders/:id/confirm
  router.patch('/staff/orders/:id/confirm', async (req, res) => {
    try {
      const { id } = req.params;
      const { confirmedBy = 'Staff Member' } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      order.status = 'confirmed';
      order.confirmedAt = new Date();
      order.confirmedBy = confirmedBy;
      await order.save();

      console.log(`✅ [Socket.IO] Order ${order.orderNumber} confirmed by ${confirmedBy}`);

      if (io) {
        io.to('staff').emit('order:status', order);
        io.to(`table-${order.table}`).emit('order:status', order);
        io.to(`order-${order._id}`).emit('order:status', order);
      }

      res.json({ success: true, order });
    } catch (err) {
      console.error('Error confirming order:', err);
      res.status(500).json({ success: false, error: 'Failed to confirm order' });
    }
  });

  // PATCH /api/staff/orders/:id/status
  router.patch('/staff/orders/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, confirmedBy } = req.body;

      if (!['pending', 'confirmed', 'preparing', 'served', 'cancelled'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      order.status = status;
      if (status === 'served') {
        order.servedAt = new Date();
      }
      if (confirmedBy && !order.confirmedBy) {
        order.confirmedBy = confirmedBy;
      }
      await order.save();

      if (io) {
        io.to('staff').emit('order:status', order);
        io.to(`table-${order.table}`).emit('order:status', order);
        io.to(`order-${order._id}`).emit('order:status', order);
      }

      res.json({ success: true, order });
    } catch (err) {
      console.error('Error updating order status:', err);
      res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
  });

  // POST /api/staff/login
  router.post('/staff/login', async (req, res) => {
    try {
      const { pin } = req.body;
      if (!pin) {
        return res.status(400).json({ success: false, error: 'PIN is required' });
      }

      const staff = await Staff.findOne({ pin, active: true }).lean();
      if (!staff) {
        return res.status(401).json({ success: false, error: 'Invalid Staff PIN' });
      }

      res.json({
        success: true,
        staff: {
          id: staff._id,
          name: staff.name,
          role: staff.role,
        },
      });
    } catch (err) {
      console.error('Error staff login:', err);
      res.status(500).json({ success: false, error: 'Staff login failed' });
    }
  });

  return router;
};
