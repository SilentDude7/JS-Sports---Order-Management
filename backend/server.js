import express from 'express';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import deliverRoutes from './routes/deliverRoute.js';
import userRoutes from './routes/userRoutes.js'; // ✅ Import User routes
import Order from './models/orderModel.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

connectDB();

const app = express();

// ✅ Apply CORS middleware first
app.use(cors());

// ✅ Body parser
app.use(express.json());

// ✅ Direct test route
app.get('/api/test-direct', (req, res) => {
  res.send('Direct route from server.js is working!');
});

// ✅ Use existing routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliverRoutes);

// ✅ Add user routes
app.use('/api/users', userRoutes); // New User API endpoint

// ✅ Delete an order
app.delete('/api/delete-order/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndDelete(orderId); // or mark as removed
    res.status(200).json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error });
  }
});

// ✅ Get total order count
app.get('/api/orders/count', async (req, res) => {
  try {
    const count = await Order.countDocuments(); // Assuming MongoDB/Mongoose
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders count' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
