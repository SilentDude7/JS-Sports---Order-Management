import mongoose from 'mongoose';
import express from 'express';
import Order from '../models/orderModel.js';
import DeliveryPerson from '../models/DeliveryPersonModel.js'; // adjust path if different


const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    // Build query object
    const query = {};
    if (status) query.status = status;

    // Populate deliveryPerson details (adjust fields as needed)
    const orders = await Order.find(query)
      .populate('deliveryPerson', 'name vehicleType')
      .populate('customer', 'address'); // Assuming customer has address

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// GET all orders
router.get('/get-orders', async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/delete-order/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
})

// @desc    Get orders for a specific user by userId
// @route   GET /api/orders/user/:userId
// @access  Public (later you can make it private)
// routes/orderRoutes.js
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ "customer.customerId": req.params.userId });
    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST new order
router.post('/save-order', async (req, res) => {
  try {
    console.log('Order data received:', req.body);

    // Validate required fields
    if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }
    if (typeof req.body.total !== 'number') {
      return res.status(400).json({ error: 'Total amount must be a number' });
    }

    // Validate customer data
    if (!req.body.customer || !req.body.customer.name || !req.body.customer.email) {
      return res.status(400).json({ error: 'Customer information is required' });
    }

    // Validate items
    for (const item of req.body.items) {
      if (!item.product || typeof item.product !== 'string' || item.product.trim().length === 0) {
        return res.status(400).json({ error: 'Invalid product name in items' });
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ error: 'Invalid quantity in items' });
      }
      if (typeof item.price !== 'number' || item.price < 0) {
        return res.status(400).json({ error: 'Invalid price in items' });
      }
    }

    // Validate payment method
    if (!req.body.paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    // Validate financial fields
    const financialFields = ['subtotal', 'shipping', 'tax', 'discount', 'total'];
    for (const field of financialFields) {
      if (typeof req.body[field] !== 'number' || req.body[field] < 0) {
        return res.status(400).json({ error: `Invalid ${field} value` });
      }
    }

    // Order fingerprint for duplicate prevention
    const orderFingerprint = JSON.stringify({
      items: req.body.items.map(i => ({ product: i.product, quantity: i.quantity })),
      total: req.body.total,
      customer: { name: req.body.customer.name, email: req.body.customer.email },
      timestamp: Math.floor(Date.now() / 60000)
    });

    const existingOrder = await Order.findOne({
      fingerprint: orderFingerprint,
      createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) }
    });

    if (existingOrder) {
      console.log('⚠️ Duplicate order blocked');
      return res.status(200).json(existingOrder);
    }

    // Create order with proper customer structure
    const orderData = {
      items: req.body.items,
      paymentMethod: req.body.paymentMethod,
      subtotal: req.body.subtotal,
      shipping: req.body.shipping,
      tax: req.body.tax,
      discount: req.body.discount,
      total: req.body.total,
      customer: {
        customerId: req.body.customer.customerId || null,
        name: req.body.customer.name,
        email: req.body.customer.email,
        phone: req.body.customer.phone,
        address: req.body.customer.address
      },
      fingerprint: orderFingerprint,
      status: 'placed',
      statusHistory: [{ status: 'placed', timestamp: new Date() }]
    };

    const order = new Order(orderData);
    await order.save();

    console.log('✅ Order saved successfully:', order._id);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: error.message });
  }
});


// POST to update status
router.post('/update-status', async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Validate status
    const validStatuses = ['placed', 'scheduled', 'dispatched', 'delivering', 'delivered', 'failed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add this check in your /update-status route
if (newStatus === 'cancelled') {
  if (!['placed', 'scheduled'].includes(order.status)) {
    return res.status(400).json({ 
      message: `Order cannot be cancelled from ${order.status} status` 
    });
  }
}

    order.status = newStatus;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single order by ID
router.get('/get-orders/:orderId', async (req, res) => {
  try {
    console.log('Fetching order:', req.params.orderId);
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Found order:', order._id);
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: error.message });
  }
});

// In your backend routes
router.post('/fail-delivery', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow failing from 'delivering' status
    if (order.status !== 'delivering') {
      return res.status(400).json({ 
        message: `Cannot mark as failed from ${order.status} status` 
      });
    }

    // Update status and add to history
    order.status = 'failed';
    order.statusHistory.push({
      status: 'failed',
      timestamp: new Date()
    });

    await order.save();
    
    // Additional failure handling logic if needed
    // (e.g., notify customer, update inventory, etc.)
    
    res.json({ 
      success: true,
      message: 'Delivery marked as failed'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while failing delivery' 
    });
  }
});

router.get('/count', async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

console.log("✅ orderRoutes.js loaded");
export default router;
