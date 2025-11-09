import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: [
    {
      product: {
        type: String,
        required: true,
        trim: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      image: {
        type: String,
        required: false,
      },
      size: {
        type: String,
        required: false,
        trim: true,
      }
    }
  ],
  paymentMethod: {
    type: String,
    required: true,
    trim: true,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  shipping: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['placed', 'scheduled', 'dispatched', 'delivering', 'delivered', 'failed', 'returned', 'cancelled'],
    default: 'placed',
  },
  deliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPerson',
  },
  // Updated customer field to support both ObjectId and embedded details
  customer: {
    // For existing customer references
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: false,
    },
    // For new customer details
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
    }
  },
  statusHistory: [
    {
      status: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  fingerprint: {
    type: String,
    required: false,
  }
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;