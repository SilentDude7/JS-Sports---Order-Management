import mongoose from 'mongoose';
import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;
    
    // Build query object
    const query = {};
    
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' }; // simple text search
    }
    
    if (category) {
      query.category = category; // since it's just a string
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// GET all products (alternative endpoint)
router.get('/get-products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE product (hard delete since no isActive in schema)
router.delete('/delete-product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

// POST new product
router.post('/save-product', async (req, res) => {
  try {
    console.log('Product data received:', req.body);

    // Basic validation
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    if (typeof req.body.price !== 'number' || req.body.price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    // Validate stock
    if (req.body.countInStock !== undefined && (typeof req.body.countInStock !== 'number' || req.body.countInStock < 0)) {
      return res.status(400).json({ error: 'Stock must be a positive number' });
    }

    const product = new Product({
      ...req.body
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST to update product
router.post('/update-product', async (req, res) => {
  try {
    const { productId, updateData } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Prevent certain fields from being updated
    const protectedFields = ['_id', 'createdAt', 'updatedAt'];
    Object.keys(updateData).forEach(key => {
      if (!protectedFields.includes(key)) {
        product[key] = updateData[key];
      }
    });

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single product by ID
router.get('/get-products/:productId', async (req, res) => {
  try {
    console.log('Fetching product:', req.params.productId);
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Found product:', product._id);
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET product count
router.get('/count', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

console.log("✅ productRoutes.js loaded");
export default router;
