import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import {
  FiShoppingBag,
  FiCalendar,
  FiTruck,
  FiMapPin,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiChevronRight,
  FiPackage,
  FiUser,
  FiBox,
  FiSearch,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiMic,
  FiTrash2,
  FiPlus
} from 'react-icons/fi';

const statusSequence = ['placed', 'scheduled', 'dispatched', 'delivering'];

const statusConfig = {
  placed: {
    label: 'Placed',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  scheduled: {
    label: 'Scheduled',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
  },
  dispatched: {
    label: 'Dispatched',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
  },
  delivering: {
    label: 'Delivering',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  failed: {
    label: 'Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  }
};

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // store the full order object fetched from DB
  const [sortConfig, setSortConfig] = useState({ key: 'orderDate', direction: 'descending' });
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [allProducts, setAllProducts] = useState([]); // full list
  const [filteredProducts, setFilteredProducts] = useState([]); // for suggestions
  const [customerError, setCustomerError] = useState('');
  const [newOrderData, setNewOrderData] = useState({
    customer: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    items: [{ product: '', quantity: 1, size: '' }],
    status: 'placed'
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
  isOpen: false,
  orderId: null,
  orderNumber: ''
});
  const [successModal, setSuccessModal] = useState({
  isOpen: false,
  title: '',
  message: '',
  type: '' // 'success' or 'error'
});
  // Date formatting utility function
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  // Helper function to calculate time since status change
const getTimeInCurrentStatus = (order) => {
  if (!order.statusHistory || order.statusHistory.length === 0) {
    return { hours: 0, minutes: 0, text: '0 minutes' };
  }

  // Find the latest timestamp for the current status
  const currentStatusEntries = order.statusHistory
    .filter(entry => entry.status === order.status)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  let lastStatusChange;
  if (currentStatusEntries.length > 0) {
    lastStatusChange = new Date(currentStatusEntries[0].timestamp);
  } else {
    // fallback: use last status change or order creation date
    lastStatusChange = new Date(order.statusHistory[order.statusHistory.length - 1].timestamp);
  }

  const now = new Date();
  const diffMs = now - lastStatusChange;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let text = '';
  if (diffHours > 0) {
    text = `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    if (diffMinutes > 0) {
      text += ` ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    }
  } else {
    text = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  }

  return { hours: diffHours, minutes: diffMinutes, text };
};


  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('http://localhost:3000/api/orders/get-orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
      filterAndSearchOrders(data, searchTerm, activeTab);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

const checkCustomerExists = async () => {
  const { name, email, phone } = newOrderData.customer;
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/check-customer?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`
    );

    const data = await response.json(); // always parse JSON

    if (!response.ok) {
      // Now this will execute for 404 or any non-2xx status
      alert(data.message || "Person not available");
      setCustomerError(data.message || "Person not available");
      return false;
    }

    setCustomerError(''); // clear any previous error
    return true;
  } catch (err) {
    console.error(err);
    alert('Server error');
    setCustomerError('Server error');
    return false;
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  const customerValid = await checkCustomerExists();
  if (!customerValid) return;

  // Continue with order submission
  console.log('Customer exists, proceed with submitting order:', newOrderData);
};


  const filterAndSearchOrders = (ordersToFilter, searchValue = '', tab = activeTab) => {
    let filtered = [...ordersToFilter];
    
    // Filter by tab
    switch (tab) {
      case 'pending':
        filtered = filtered.filter(o => statusSequence.includes(o.status));
        break;
      case 'completed':
        filtered = filtered.filter(o => o.status === 'delivered');
        break;
      case 'failed':
        filtered = filtered.filter(o => o.status === 'failed' || o.status === 'cancelled');
        break;
      default:
        filtered = filtered;
    }
    
    // Filter by search term
    if (searchValue) {
      const term = searchValue.toLowerCase();
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(term) ||
        (order.customer?.name?.toLowerCase().includes(term)) ||
        order.status.toLowerCase().includes(term) ||
        (order.customer?.address?.street?.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredOrders(filtered);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterAndSearchOrders(orders, value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterAndSearchOrders(orders, searchTerm, tab);
  };

const handleExpandOrder = async (orderId) => {
  if (expandedOrder === orderId) {
    setExpandedOrder(null);
    setSelectedOrder(null);
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/orders/get-orders/${orderId}`);
    const data = await res.json();
    setSelectedOrder(data);   // full order data including prices
    setExpandedOrder(orderId);
  } catch (err) {
    console.error('Failed to fetch order', err);
  }
};


  // Smart status suggestion function
  const getStatusSuggestion = (order) => {
    const timeInStatus = getTimeInCurrentStatus(order);
    
    if (order.status === 'placed' && timeInStatus.hours >= 4) {
      return {
        suggestedStatus: 'scheduled',
        message: `Order has been placed for ${timeInStatus.text}`,
        urgency: timeInStatus.hours >= 6 ? 'high' : 'medium'
      };
    }
    
    if (order.status === 'scheduled' && timeInStatus.hours >= 2) {
      return {
        suggestedStatus: 'dispatched',
        message: `Scheduled for ${timeInStatus.text} but not yet dispatched`,
        urgency: timeInStatus.hours >= 4 ? 'high' : 'medium'
      };
    }
    
    if (order.status === 'dispatched' && timeInStatus.hours >= 1) {
      return {
        suggestedStatus: 'delivering',
        message: `Dispatched for ${timeInStatus.text} but not yet out for delivery`,
        urgency: timeInStatus.hours >= 2 ? 'high' : 'medium'
      };
    }
    
    return null;
  };

  // Function to determine if an order needs attention
  const needsAttention = (order) => {
    const timeInStatus = getTimeInCurrentStatus(order);
    
    if (order.status === 'placed' && timeInStatus.hours >= 4) {
      return {
        needsAttention: true,
        message: `Order placed for ${timeInStatus.text}`,
        urgency: timeInStatus.hours >= 6 ? 'high' : 'medium'
      };
    }
    
    if (order.status === 'scheduled' && timeInStatus.hours >= 2) {
      return {
        needsAttention: true,
        message: `Scheduled for ${timeInStatus.text}`,
        urgency: timeInStatus.hours >= 4 ? 'high' : 'medium'
      };
    }
    
    if (order.status === 'dispatched' && timeInStatus.hours >= 1) {
      return {
        needsAttention: true,
        message: `Dispatched for ${timeInStatus.text}`,
        urgency: timeInStatus.hours >= 2 ? 'high' : 'medium'
      };
    }
    
    return { needsAttention: false };
  };

  const generateXLSXReport = () => {
    const data = [
      ['Order ID', 'Customer Name', 'Status', 'Items Count', 'Order Date', 'Delivery Address'],
      ...filteredOrders.map(order => [
        order._id,
        order.customer?.name || 'Guest',
        order.status,
        order.items.length,
        formatDate(order.orderDate), // Date only
        order.customer?.address?.street || 'N/A'
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Order Report");
    XLSX.writeFile(wb, `Order_Status_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('http://localhost:3000/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Update failed');

const updatedOrders = orders.map(order => {
  if (order._id === orderId) {
    const updatedHistory = [
      ...(order.statusHistory || []),
      { status: newStatus, timestamp: new Date().toISOString() }
    ];
    return { ...order, status: newStatus, statusHistory: updatedHistory };
  }
  return order;
});

      
      setOrders(updatedOrders);
      filterAndSearchOrders(updatedOrders, searchTerm, activeTab);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await fetch('http://localhost:3000/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          newStatus: 'cancelled' 
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Cancellation failed');

      const updatedOrders = orders.map(order =>
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      );
      
      setOrders(updatedOrders);
      filterAndSearchOrders(updatedOrders, searchTerm, activeTab);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Delete order function
const handleDeleteOrder = async (orderId) => {
  const orderToDelete = orders.find(order => order._id === orderId);
  setDeleteConfirmModal({
    isOpen: true,
    orderId: orderId,
    orderNumber: `#${orderId.slice(-6).toUpperCase()}`,
    customerName: orderToDelete?.customer?.name || 'Guest'
  });
};

const confirmDeleteOrder = async () => {
  const { orderId } = deleteConfirmModal;
  
  try {
    setDeletingOrder(orderId);
    const res = await fetch(`http://localhost:3000/api/orders/delete-order/${orderId}`, {
      method: 'DELETE',
    });
    
    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.message || 'Delete failed');
    }
    
    // Remove the deleted order from state
    const updatedOrders = orders.filter(order => order._id !== orderId);
    setOrders(updatedOrders);
    filterAndSearchOrders(updatedOrders, searchTerm, activeTab);
    
    // Close modal and show success
    setDeleteConfirmModal({ isOpen: false, orderId: null, orderNumber: '', customerName: '' });
    
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    setDeletingOrder(null);
  }
};

const cancelDeleteOrder = () => {
  setDeleteConfirmModal({ isOpen: false, orderId: null, orderNumber: '', customerName: '' });
};

  // New Order Functions
  const handleNewOrderClick = () => {
    setShowNewOrderModal(true);
    setNewOrderData({
      customer: {
        name: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      },
      items: [{ product: '', quantity: 1, size: '' }],
      status: 'placed'
    });
    setFormErrors({});
  };

  const handleInputChange = (e, section, field, subField = null) => {
    const value = e.target.value;
    setNewOrderData(prev => {
      const updated = { ...prev };
      if (subField) {
        updated[section][field][subField] = value;
      } else if (field) {
        updated[section][field] = value;
      } else {
        updated[section] = value;
      }
      return updated;
    });

    // Clear error when user starts typing
    if (subField) {
      const errorKey = `${field}${subField.charAt(0).toUpperCase() + subField.slice(1)}`;
      if (formErrors[errorKey]) {
        setFormErrors(prev => ({ ...prev, [errorKey]: '' }));
      }
    } else if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

const handleItemChange = (index, field, value) => {
  const updatedItems = [...newOrderData.items];
  updatedItems[index][field] = value;
  setNewOrderData(prev => ({ ...prev, items: updatedItems }));

  // Only filter if field is "product"
  if (field === 'product') {
    const suggestions = allProducts
      .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
      .map(p => p.name);
    setFilteredProducts(suggestions);
  }
};


  const addItem = () => {
    setNewOrderData(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, size: '' }]
    }));
  };

  const removeItem = (index) => {
    if (newOrderData.items.length <= 1) return;
    setNewOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Customer name validation
    if (!newOrderData.customer.name.trim()) {
      errors.customerName = 'Customer name is required';
    }
    
    // Email validation
    if (!newOrderData.customer.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newOrderData.customer.email)) {
      errors.email = 'Please enter a valid email address (e.g., abc@xyz.com)';
    }
    
    // Phone validation
    if (!newOrderData.customer.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(newOrderData.customer.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Address validation
    if (!newOrderData.customer.address.street.trim()) {
      errors.addressStreet = 'Street address is required';
    }
    
    if (!newOrderData.customer.address.city.trim()) {
      errors.addressCity = 'City is required';
    }
    
    if (!newOrderData.customer.address.state.trim()) {
      errors.addressState = 'State is required';
    }
    
    if (!newOrderData.customer.address.zipCode.trim()) {
      errors.addressZipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(newOrderData.customer.address.zipCode)) {
      errors.addressZipCode = 'Please enter a valid ZIP code';
    }
    
    // Items validation
    newOrderData.items.forEach((item, index) => {
      if (!item.product.trim()) {
        errors[`itemProduct${index}`] = 'Product name is required';
      }
      
      if (!item.quantity || item.quantity < 1) {
        errors[`itemQuantity${index}`] = 'Quantity must be at least 1';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleCreateOrder = async () => {
  if (!validateForm()) return;

  // Check customer exists
  const customerResponse = await fetch(
    `http://localhost:3000/api/users/check-customer?name=${encodeURIComponent(newOrderData.customer.name)}&email=${encodeURIComponent(newOrderData.customer.email)}&phone=${encodeURIComponent(newOrderData.customer.phone)}`
  );
  const customerData = await customerResponse.json();

  if (!customerResponse.ok) {
    // Replace alert with error modal
    setSuccessModal({
      isOpen: true,
      title: 'Error',
      message: customerData.message || "Person not available",
      type: 'error'
    });
    return;
  }

  const customerId = customerData.user._id;

  // Build items with price
  const itemsWithPrices = newOrderData.items.map(item => {
    const productFromDB = allProducts.find(p => p.name === item.product.trim());
    if (!productFromDB) {
      setSuccessModal({
        isOpen: true,
        title: 'Error',
        message: `Product "${item.product}" not found`,
        type: 'error'
      });
      throw new Error(`Product "${item.product}" not found`);
    }
    return {
      product: item.product.trim(),
      quantity: Number(item.quantity) || 1,
      price: Number(productFromDB.price) || 0,
      size: item.size || null,
      image: productFromDB.images && productFromDB.images.length > 0 
        ? productFromDB.images[0].url 
        : null
    };
  });

  const subtotal = itemsWithPrices.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 50;
  const tax = subtotal * 0.08;
  const discount = 0;
  const total = subtotal + shipping + tax - discount;

  const orderPayload = {
    items: itemsWithPrices,
    paymentMethod: newOrderData.paymentMethod || 'Cash on Delivery',
    subtotal,
    shipping,
    tax,
    discount,
    total,
    customer: {
      customerId: customerData.user._id,
      name: newOrderData.customer.name.trim(),
      email: newOrderData.customer.email.trim(),
      phone: newOrderData.customer.phone.trim(),
      address: {
        street: newOrderData.customer.address.street.trim(),
        city: newOrderData.customer.address.city.trim(),
        state: newOrderData.customer.address.state.trim(),
        zipCode: newOrderData.customer.address.zipCode.trim(),
      }
    }
  };

  try {
    const res = await fetch('http://localhost:3000/api/orders/save-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || result.message || 'Failed to create order');

    // Replace alert with success modal
    setSuccessModal({
      isOpen: true,
      title: 'Success!',
      message: 'Order created successfully!',
      type: 'success'
    });
    
    setShowNewOrderModal(false);
    fetchOrders();
  } catch (err) {
    setSuccessModal({
      isOpen: true,
      title: 'Error',
      message: err.message,
      type: 'error'
    });
  }
};

// Function to close success modal
const closeSuccessModal = () => {
  setSuccessModal({ isOpen: false, title: '', message: '', type: '' });
};

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSearchOrders(orders, searchTerm, activeTab);
  }, [sortConfig]);

    useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products/get-products');
      const data = await res.json();
      setAllProducts(data); // array of products from DB
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  fetchProducts();
}, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md w-full animate-pulse">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <FiLoader className="text-3xl animate-spin text-blue-500" />
          </div>
          <div className="h-8 bg-gray-200 rounded-full w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-full w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md w-full border-l-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-2xl text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={fetchOrders}
        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors shadow-md"
      >
        Retry
      </button>
    </div>
  </div>
);
}

return (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-3 bg-blue-500 text-white rounded-lg shadow-md">
                <FiTruck className="text-xl" />
              </span>
              Order Management
            </h1>
            <p className="text-gray-500 mt-2">Track and update order statuses in real-time</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                {filteredOrders.length} {activeTab === 'pending' ? 'active' : activeTab} {filteredOrders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-full shadow-sm border border-gray-200 transition-colors"
            >
              <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            <button
              onClick={generateXLSXReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-sm transition-colors"
            >
              <span className="text-sm font-medium">Export Excel</span>
            </button>
            <button
              onClick={handleNewOrderClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-sm transition-colors"
            >
              <FiPlus className="text-sm" />
              <span className="text-sm font-medium">New Order</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search orders by ID, name, status or address..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('pending')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Pending
            </button>
            <button
              onClick={() => handleTabChange('completed')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'completed' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Completed
            </button>
            <button
              onClick={() => handleTabChange('failed')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'failed' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Failed/Cancelled
            </button>
          </nav>
        </div>
      </header>

      {filteredOrders.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiBox className="text-3xl text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No {activeTab === 'pending' ? 'pending' : activeTab} orders found
          </h2>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try a different search term' : 'Check back later for new orders'}
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                filterAndSearchOrders(orders, '', activeTab);
              }}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors shadow-md"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('customer.name')}
                >
                  <div className="flex items-center">
                    Customer
                    {sortConfig.key === 'customer.name' && (
                      sortConfig.direction === 'ascending' ? 
                      <FiChevronUp className="ml-1" /> : 
                      <FiChevronDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === 'status' && (
                      sortConfig.direction === 'ascending' ? 
                      <FiChevronUp className="ml-1" /> : 
                      <FiChevronDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('orderDate')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'orderDate' && (
                      sortConfig.direction === 'ascending' ? 
                      <FiChevronUp className="ml-1" /> : 
                      <FiChevronDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => {
                const current = statusConfig[order.status];
                const next = statusSequence[statusSequence.indexOf(order.status) + 1];
                const suggestion = getStatusSuggestion(order);
                const attention = needsAttention(order);
                const timeInStatus = getTimeInCurrentStatus(order);
                
                return (
                  <React.Fragment key={order._id}>
                    <tr 
                      className={`hover:bg-gray-50 cursor-pointer ${attention.needsAttention ? attention.urgency === 'high' ? 'bg-red-50' : 'bg-yellow-50' : ''}`}
                      onClick={() => handleExpandOrder(order._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              #{order._id.slice(-6).toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customer?.name || 'Guest'}</div>
                        <div className="text-sm text-gray-500">{order.customer?.phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${current.bgColor} ${current.color}`}>
                          {current.label}
                        </span>
                        <div className="mt-1 text-xs text-gray-500">
                          <FiClock className="inline mr-1" /> {timeInStatus.text}
                        </div>
                        {suggestion && (
                          <div className={`mt-1 text-xs ${suggestion.urgency === 'high' ? 'text-red-500' : 'text-yellow-500'}`}>
                            ⚡ {suggestion.message}
                          </div>
                        )}
                        {attention.needsAttention && (
                          <div className={`mt-1 text-xs font-medium ${attention.urgency === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>
                            ⚠️ Attention: {attention.message}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center">
                          {/* Delete button for completed and failed/cancelled tabs */}
                          {(activeTab === 'completed' || activeTab === 'failed') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder(order._id);
                              }}
                              disabled={deletingOrder === order._id}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors mr-2"
                              title="Delete order"
                            >
                            {deletingOrder === order._id ? (
                            <FiLoader className="animate-spin" />
                            ) : (
                            <FiTrash2 />
                            )}
                            </button>
                          )}
                          {expandedOrder === order._id ? (
                            <FiChevronUp className="text-gray-400" />
                          ) : (
                            <FiChevronDown className="text-gray-400" />
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedOrder === order._id && selectedOrder && (
                    <tr className="bg-gray-50">
                    <td colSpan="5" className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                      <ul className="text-sm text-gray-600">
                        {selectedOrder.items.map((item, index) => (
                          <li key={index} className="mb-4">
                            <div>
                              {item.quantity} × {item.product}
                              {item.size && ` (${item.size})`}
                            </div>
                            <div className="text-sm font-medium text-gray-800 mt-1">
                              LKR {Number(item.price* item.quantity).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                            </div>
                          </li>
                              ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Address</h4>
                              <p className="text-sm text-gray-600">
                                {order.customer?.address?.street || 'N/A'}<br />
                                {order.customer?.address?.city && `${order.customer.address.city}, `}
                                {order.customer?.address?.state} {order.customer?.address?.zipCode}
                              </p>
                              <div className="mt-2 text-xs text-gray-500">
                                <FiClock className="inline mr-1" /> 
                                In {current.label.toLowerCase()} for {timeInStatus.text}
                              </div>
                              {attention.needsAttention && (
                                <div className={`mt-2 p-2 rounded-md text-xs font-medium ${
                                  attention.urgency === 'high' 
                                    ? 'bg-red-100 text-red-700 border border-red-200' 
                                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                }`}>
                                  ⚠️ Attention needed: {attention.message}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Update Status</h4>
                              
                              {/* Smart Status Suggestion */}
                              {suggestion && (
                                <div className={`mb-3 p-2 rounded-md text-xs ${
                                  suggestion.urgency === 'high' 
                                    ? 'bg-red-100 text-red-700 border border-red-200' 
                                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                }`}>
                                  <div className="font-medium">⚡ Smart Suggestion</div>
                                  <div>{suggestion.message}</div>
                                </div>
                              )}
                              
                              {order.status === 'cancelled' ? (
                                <div className="text-sm text-gray-700 py-2">
                                  Order was cancelled
                                </div>
                              ) : order.status === 'delivered' ? (
                                <div className="text-sm text-green-700 py-2">
                                  Order completed successfully
                                </div>
                              ) : order.status === 'failed' ? (
                                <div className="text-sm text-red-700 py-2">
                                  Delivery failed
                                </div>
                              ) : next ? (
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => updateStatus(order._id, next)}
                                    className={`flex items-center justify-between py-2 px-4 ${current.bgColor} hover:opacity-90 rounded-lg font-medium transition-all text-sm`}
                                  >
                                    <span>Mark as {next}</span>
                                    <FiChevronRight />
                                  </button>
                                  {(order.status === 'placed' || order.status === 'scheduled') && (
                                    <button
                                      onClick={() => handleCancelOrder(order._id)}
                                      className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all text-sm"
                                    >
                                      <FiXCircle /> Cancel Order
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-green-700 py-2">
                                  Waiting for delivery confirmation
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <footer className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()} • Auto-refresh every 15 seconds
        </p>
      </footer>
    </div>

    {/* New Order Modal */}
    {showNewOrderModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Create New Order</h2>
        <p className="text-gray-600">Fill in all the required details for the new order</p>
      </div>

      {/* Form Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Customer Information</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.customerName ? 'border-red-500' : 'border-gray-300'
                }`}
                value={newOrderData.customer.name}
                onChange={(e) => handleInputChange(e, 'customer', 'name')}
                placeholder="Enter customer name"
              />
              {formErrors.customerName && (
                <p className="mt-1 text-sm text-red-500">{formErrors.customerName}</p>
              )}
            </div>

<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
  <input
    type="email"
    data-testid="email-input"
    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={newOrderData.customer.email}
    onChange={(e) => handleInputChange(e, 'customer', 'email')}
    placeholder="Enter email address (abc@xyz.com)"
  />
  {formErrors.email && (
    <p data-testid="email-error" className="mt-1 text-sm text-red-500">{formErrors.email}</p>
  )}
</div>

<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
  <input
    type="tel"
    data-testid="phone-input"
    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={newOrderData.customer.phone}
    onChange={(e) => handleInputChange(e, 'customer', 'phone')}
    placeholder="Enter 10-digit phone number"
  />
  {formErrors.phone && (
    <p data-testid="phone-error" className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
  )}
</div>
</div>

{/* Address Info */}
<div>
  <h3 className="text-lg font-medium text-gray-800 mb-4">Delivery Address</h3>

  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
    <input
      type="text"
      data-testid="address-street-input"
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={newOrderData.customer.address.street}
      onChange={(e) => handleInputChange(e, 'customer', 'address', 'street')}
      placeholder="Enter street address"
    />
    {formErrors.addressStreet && (
      <p data-testid="address-street-error" className="mt-1 text-sm text-red-500">{formErrors.addressStreet}</p>
    )}
  </div>

  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
      <input
        type="text"
        data-testid="address-city-input"
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={newOrderData.customer.address.city}
        onChange={(e) => handleInputChange(e, 'customer', 'address', 'city')}
        placeholder="City"
      />
      {formErrors.addressCity && (
        <p data-testid="address-city-error" className="mt-1 text-sm text-red-500">{formErrors.addressCity}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
      <input
        type="text"
        data-testid="address-state-input"
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={newOrderData.customer.address.state}
        onChange={(e) => handleInputChange(e, 'customer', 'address', 'state')}
        placeholder="State"
      />
      {formErrors.addressState && (
        <p data-testid="address-state-error" className="mt-1 text-sm text-red-500">{formErrors.addressState}</p>
      )}
    </div>
  </div>

  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
    <input
      type="text"
      data-testid="address-zip-input"
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={newOrderData.customer.address.zipCode}
      onChange={(e) => handleInputChange(e, 'customer', 'address', 'zipCode')}
      placeholder="ZIP code"
    />
    {formErrors.addressZipCode && (
      <p data-testid="address-zip-error" className="mt-1 text-sm text-red-500">{formErrors.addressZipCode}</p>
    )}
  </div>
</div>
</div>

{/* Order Items */}
<div className="mb-6">
  <h3 className="text-lg font-medium text-gray-800 mb-4">Order Items</h3>

  {newOrderData.items.map((item, index) => (
    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-end">

{/* Product */}
<div className="md:col-span-4 relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
  <input
    type="text"
    data-testid={`item-product-${index}`}
    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={item.product}
    onChange={(e) => {
      handleItemChange(index, 'product', e.target.value);

      // Filter products for suggestions
      const input = e.target.value.toLowerCase();
      if (input) {
        setFilteredProducts(
          allProducts
            .map(p => p.name)
            .filter(name => name.toLowerCase().includes(input))
        );
      } else {
        setFilteredProducts([]);
      }
    }}
    placeholder="Enter product name"
    autoComplete="off"
  />

  {/* Validation error */}
  {formErrors[`itemProduct${index}`] && (
    <p data-testid={`item-product-error-${index}`} className="mt-1 text-sm text-red-500">
      {formErrors[`itemProduct${index}`]}
    </p>
  )}

  {/* Suggestions dropdown */}
  {filteredProducts.length > 0 && item.product && (
    <ul className="absolute z-10 w-full bg-white border rounded-md shadow-md max-h-40 overflow-y-auto mt-1">
      {filteredProducts.map((name, i) => (
        <li
          key={i}
          className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
          onClick={() => {
            handleItemChange(index, 'product', name);
            setFilteredProducts([]); // clear suggestions
          }}
        >
          {name}
        </li>
      ))}
    </ul>
  )}
</div>

{/* Quantity */}
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
  <input
    type="number"
    min="1"
    data-testid={`item-quantity-${index}`}
    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={item.quantity}
    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
  />
  {formErrors[`itemQuantity${index}`] && (
    <p data-testid={`item-quantity-error-${index}`} className="mt-1 text-sm text-red-500">
      {formErrors[`itemQuantity${index}`]}
    </p>
  )}
</div>

      {/* Size (Optional) */}
      <div className="md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Size (Optional)</label>
        <input
          type="text"
          data-testid={`item-size-${index}`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={item.size}
          onChange={(e) => handleItemChange(index, 'size', e.target.value)}
          placeholder="Size"
        />
      </div>

      {/* Remove button */}
      <div className="md:col-span-1">
        <button
          type="button"
          onClick={() => removeItem(index)}
          className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          disabled={newOrderData.items.length <= 1}
          data-testid={`item-remove-${index}`}
        >
          <FiXCircle className="inline" />
        </button>
      </div>
    </div>
  ))}

  <button
    type="button"
    onClick={addItem}
    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
    data-testid="add-item-btn"
  >
    <FiPlus className="text-sm" />
    Add Another Item
  </button>
</div>

      </div>

      {/* Footer Buttons */}
      <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
        <button
          onClick={() => setShowNewOrderModal(false)}
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateOrder}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          Create Order
        </button>
      </div>   
    </div>
  </div> 
)}
{/* Delete Confirmation Modal - MOVED OUTSIDE New Order Modal */}
{deleteConfirmModal.isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <FiAlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Order</h3>
            <p className="text-gray-600 text-sm mt-1">This action cannot be undone</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <p className="text-gray-700 mb-2">
          Are you sure you want to delete order <span className="font-semibold">{deleteConfirmModal.orderNumber}</span>?
        </p>
        <p className="text-gray-600 text-sm">
          Customer: <span className="font-medium">{deleteConfirmModal.customerName}</span>
        </p>
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <FiAlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">
              This will permanently remove the order from the system. All order data including items and customer information will be lost.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
        <button
          onClick={cancelDeleteOrder}
          disabled={deletingOrder === deleteConfirmModal.orderId}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={confirmDeleteOrder}
          disabled={deletingOrder === deleteConfirmModal.orderId}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {deletingOrder === deleteConfirmModal.orderId ? (
            <>
              <FiLoader className="animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <FiTrash2 className="w-4 h-4" />
              Delete Order
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
{/* Success/Error Modal */}
{successModal.isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            successModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {successModal.type === 'success' ? (
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <FiAlertCircle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{successModal.title}</h3>
            <p className="text-gray-600 text-sm mt-1">
              {successModal.type === 'success' ? 'Operation completed successfully' : 'An error occurred'}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <p className={`text-center ${
          successModal.type === 'success' ? 'text-green-700' : 'text-red-700'
        }`}>
          {successModal.message}
        </p>
        {successModal.type === 'success' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FiCheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-green-700 text-sm">
                The order has been created and added to the system. You can now track its progress.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 flex justify-center">
        <button
          onClick={closeSuccessModal}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            successModal.type === 'success' 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {successModal.type === 'success' ? 'Continue' : 'Try Again'}
        </button>
      </div>
    </div>
  </div>
)}
</div>
);
};

export default AdminOrder;