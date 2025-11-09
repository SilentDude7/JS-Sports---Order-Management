import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const deliveryPersonSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },

  // Delivery Information
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'car', 'walking'],
    default: 'bike'
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },

  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Never return password in queries by default
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },

  // Activity tracking
  currentDeliveries: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Order',
    default: []
  },

  // Timestamps
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: null
  },

  // Activity History
  deliveryHistory: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    deliveryDate: {
      type: Date,
      default: () => new Date()
    },
    status: {
      type: String,
      enum: ['assigned', 'picked_up', 'delivered', 'failed', 'returned'],
      default: 'assigned'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Add 2dsphere index for geospatial queries
deliveryPersonSchema.index({ currentLocation: '2dsphere' });

// Pre-save hook to hash password before saving
deliveryPersonSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash the password with a salt round of 10
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password in database
deliveryPersonSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to remove sensitive information when sending user data
deliveryPersonSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const DeliveryPerson = mongoose.model('DeliveryPerson', deliveryPersonSchema);
export default DeliveryPerson;