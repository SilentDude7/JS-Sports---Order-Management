import mongoose from 'mongoose';
import express from 'express';
import Order from '../models/orderModel.js';
import DeliveryPerson from '../models/DeliveryPersonModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Delivery Person Login with JWT
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    const person = await DeliveryPerson.findOne({ email }).select('+password');
    
    if (!person) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' // Generic message for security
      });
    }

    if (!person.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account deactivated. Contact administrator.' 
      });
    }

    // Use bcrypt.compare directly (more reliable than schema method)
    const isMatch = await bcrypt.compare(password, person.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' // Generic message for security
      });
    }

    // Update last active time
    person.lastActive = new Date();
    await person.save();

    // Create JWT token
    const token = jwt.sign(
      { 
        id: person._id, 
        role: 'delivery',
        vehicleType: person.vehicleType
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Remove sensitive data before sending response
    const personData = person.toObject();
    delete personData.password;
    delete personData.salt;
    delete personData.__v;

    res.json({ 
      success: true, 
      person: personData,
      token
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get current delivery person
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const person = await DeliveryPerson.findById(decoded.id).select('-password -salt -__v');

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Delivery person not found'
      });
    }

    res.json({
      success: true,
      person
    });

  } catch (err) {
    console.error('Error fetching delivery person:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery person',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get assigned deliveries
router.get('/deliveries', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const orders = await Order.find({
      deliveryPerson: decoded.id,
      status: { $in: ['assigned', 'out-for-delivery', 'delivered'] }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (err) {
    console.error('Error fetching deliveries:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update delivery status
router.patch('/deliveries/:id/status', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      await session.abortTransaction();
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate status
    const validStatuses = ['out-for-delivery', 'delivered', 'failed'];
    if (!validStatuses.includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Update order status
    const updatedOrder = await Order.findOneAndUpdate(
      { 
        _id: id,
        deliveryPerson: decoded.id 
      },
      { 
        status,
        $push: {
          statusHistory: {
            status,
            timestamp: new Date()
          }
        }
      },
      { new: true, session }
    );

    if (!updatedOrder) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    // Update delivery person's history if delivered
    if (status === 'delivered') {
      await DeliveryPerson.updateOne(
        { _id: decoded.id },
        { 
          $pull: { currentDeliveries: id },
          $push: {
            deliveryHistory: {
              orderId: id,
              status: 'delivered',
              deliveryDate: new Date()
            }
          }
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      order: updatedOrder
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating delivery status:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update availability
router.patch('/availability', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const updatedPerson = await DeliveryPerson.findByIdAndUpdate(
      decoded.id,
      { isAvailable },
      { new: true }
    ).select('-password -salt');

    if (!updatedPerson) {
      return res.status(404).json({
        success: false,
        message: 'Delivery person not found'
      });
    }

    res.json({
      success: true,
      person: updatedPerson
    });

  } catch (err) {
    console.error('Error updating availability:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get cancelled orders
router.get('/orders/cancelled', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const orders = await Order.find({
      deliveryPerson: decoded.id,
      status: 'cancelled'
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (err) {
    console.error('Error fetching cancelled orders:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cancelled orders',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


// Delivery Person Registration (Fixed)
router.post('/register', async (req, res) => {
  try {
    const { 
      firstName,
      lastName,
      email,
      phone,
      vehicleType,
      licenseNumber,
      password
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !licenseNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check for existing user
    const existingPerson = await DeliveryPerson.findOne({ 
      $or: [{ email }, { licenseNumber }] 
    });

    if (existingPerson) {
      const conflictField = existingPerson.email === email ? 'Email' : 'License number';
      return res.status(409).json({
        success: false,
        message: `${conflictField} already in use`
      });
    }

    // Hash password properly
    const hashedPassword = await bcrypt.hash(password, 10);

    const newPerson = new DeliveryPerson({
      firstName,
      lastName,
      email,
      phone,
      vehicleType: vehicleType || 'bike',
      licenseNumber,
      password: hashedPassword,
      isActive: true,
      isAvailable: true,
      currentDeliveries: []
    });

    await newPerson.save();

    // Prepare response without sensitive data
    const personResponse = newPerson.toObject();
    delete personResponse.password;
    delete personResponse.__v;

    res.status(201).json({
      success: true,
      message: 'Delivery person registered successfully',
      person: personResponse
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});
// Get Available Delivery Persons
router.get('/available', async (req, res) => {
  try {
    const availablePersons = await DeliveryPerson.find({
      isActive: true,
      isAvailable: true
    }).select('-password -salt');

    res.json({
      success: true,
      count: availablePersons.length,
      persons: availablePersons
    });
  } catch (err) {
    console.error('Error fetching available delivery persons:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available delivery persons',
      error: err.message
    });
  }
});

// Get orders ready for delivery assignment
router.get('/delivery-orders', async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: 'delivering',
      deliveryPerson: { $exists: false }
    });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    console.error('Error fetching delivery orders:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery orders',
      error: err.message
    });
  }
});

// Assign delivery person to order
router.post('/assign-delivery', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, deliveryPersonId } = req.body;
    
    if (!orderId || !deliveryPersonId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Both orderId and deliveryPersonId are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(deliveryPersonId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery person ID format'
      });
    }

    // 1. Find delivery person
    const person = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      isActive: true
    }).session(session);

    if (!person) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Delivery person not found or inactive'
      });
    }

    // 2. Verify order
    const order = await Order.findOne({
      _id: orderId,
      status: 'delivering'
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found or not ready for delivery'
      });
    }

    // 3. Assign order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        deliveryPerson: deliveryPersonId,
        status: 'out-for-delivery',
        $push: {
          statusHistory: {
            status: 'out-for-delivery',
            timestamp: new Date(),
            deliveryPerson: deliveryPersonId
          }
        }
      },
      { new: true, session }
    ).populate('deliveryPerson', 'firstName lastName vehicleType');

    // 4. Update delivery person
    person.currentDeliveries.push(orderId);
    person.deliveryHistory.push({
      orderId: orderId,
      status: 'assigned',
      deliveryDate: new Date()
    });

    await person.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Delivery assignment successful'
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Delivery assignment error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to assign delivery',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;