import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FiPackage, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle, 
  FiMapPin, 
  FiPhone, 
  FiUser, 
  FiTruck,
  FiLoader,
  FiHome,
  FiList,
  FiBell,
  FiSettings,
  FiLogOut,
  FiMail,
  FiKey
} from 'react-icons/fi';

const DeliverUI = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get user data from router state or initialize
  const [deliveryPerson, setDeliveryPerson] = useState(location.state || {
    email: '',
    firstName: '',
    lastName: '',
    vehicleType: '',
    phone: '',
    rating: 0
  });

  // App state
  const [deliveries, setDeliveries] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAvailable, setIsAvailable] = useState(true);

  // Get token from localStorage
  const token = localStorage.getItem('deliveryToken');

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch delivery person data
        const token = localStorage.getItem('deliveryToken');
        const response = await axios.get('http://localhost:3000/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDeliveryPerson(response.data);
        setIsAvailable(response.data.isAvailable);

        // Fetch assigned deliveries
        const deliveriesRes = await axios.get('http://localhost:3000/api/deliveries/assigned', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDeliveries(deliveriesRes.data);

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        console.error('API Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Update delivery status
  const updateDeliveryStatus = async (orderId, status) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/deliveries/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setDeliveries(prev => 
        prev.map(d => d._id === orderId ? { ...d, status } : d)
      );

      // Update current order if it's the one being modified
      if (currentOrder?._id === orderId) {
        setCurrentOrder({ ...currentOrder, status });
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Toggle availability
  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      await axios.patch(
        `http://localhost:3000/api/deliverypeople/availability`,
        { isAvailable: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAvailable(newStatus);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('deliveryToken');
    navigate('/delivery-login');
  };

  // CSS Styles
  const styles = `
    .delivery-app {
      display: flex;
      min-height: 100vh;
      font-family: 'Segoe UI', Roboto, sans-serif;
      background-color: #f8f9fa;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 280px;
      background-color: #2c3e50;
      color: white;
      padding: 20px 0;
      display: flex;
      flex-direction: column;
    }

    .profile-card {
      text-align: center;
      padding: 20px;
      border-bottom: 1px solid #34495e;
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #3498db;
      margin: 0 auto 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: white;
    }

    .login-details {
      margin: 15px 0;
      text-align: left;
      padding: 0 20px;
    }

    .login-detail {
      display: flex;
      align-items: center;
      margin: 8px 0;
      font-size: 14px;
    }

    .login-detail svg {
      margin-right: 10px;
      min-width: 20px;
    }

    .availability-toggle {
      margin: 20px 0;
      display: flex;
      justify-content: center;
      gap: 10px;
    }

    .toggle-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .available {
      background-color: #27ae60;
      color: white;
    }

    .not-available {
      background-color: #e74c3c;
      color: white;
    }

    .nav-menu {
      flex: 1;
      padding: 10px 0;
    }

    .nav-item {
      padding: 12px 20px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-item:hover {
      background-color: #34495e;
    }

    .nav-item.active {
      background-color: #3498db;
    }

    .nav-icon {
      margin-right: 12px;
      font-size: 18px;
    }

    .notification-badge {
      background-color: #e74c3c;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      margin-left: 8px;
    }

    /* Main Content Styles */
    .main-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #ddd;
    }

    /* Dashboard Styles */
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      margin: 10px 0;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 14px;
    }

    /* Delivery List Styles */
    .delivery-list {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .delivery-item {
      padding: 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .delivery-item:last-child {
      border-bottom: none;
    }

    .delivery-info h3 {
      margin-bottom: 5px;
      font-size: 16px;
    }

    .delivery-meta {
      display: flex;
      gap: 15px;
      color: #7f8c8d;
      font-size: 14px;
      margin-top: 5px;
    }

    .delivery-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .status-pending {
      background: #f39c12;
      color: white;
    }

    .status-assigned {
      background: #3498db;
      color: white;
    }

    .status-delivered {
      background: #27ae60;
      color: white;
    }

    .action-button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      margin-left: 10px;
      transition: all 0.2s;
    }

    .view-button {
      background: #3498db;
      color: white;
    }

    .view-button:hover {
      background: #2980b9;
    }

    /* Order Details Styles */
    .order-details {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .customer-info {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .customer-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #eee;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      font-size: 24px;
      color: #7f8c8d;
    }

    .delivery-map {
      height: 200px;
      background: #eee;
      margin: 20px 0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #7f8c8d;
    }

    .items-list {
      margin: 20px 0;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .delivery-notes {
      background: #fff8e1;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }

    .primary-button {
      background: #3498db;
      color: white;
    }

    .success-button {
      background: #27ae60;
      color: white;
    }

    .danger-button {
      background: #e74c3c;
      color: white;
    }

    .secondary-button {
      background: #bdc3c7;
      color: #333;
    }

    /* Loading and Error States */
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
    }

    .loading-spinner svg {
      animation: spin 1s linear infinite;
      font-size: 40px;
      color: #3498db;
      margin-bottom: 15px;
    }

    .error-message {
      background: #ffebee;
      padding: 20px;
      border-radius: 8px;
      color: #c62828;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <div className="delivery-app">
      <style>{styles}</style>
      
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="profile-card">
          <div className="profile-avatar">
            {deliveryPerson.firstName?.charAt(0)}{deliveryPerson.lastName?.charAt(0)}
          </div>
          <h3>{deliveryPerson.firstName} {deliveryPerson.lastName}</h3>
          
          <div className="login-details">
            <div className="login-detail">
              <FiMail />
              <span>{deliveryPerson.email}</span>
            </div>
            <div className="login-detail">
              <FiKey />
              <span>••••••••</span>
            </div>
            <div className="login-detail">
              <FiTruck />
              <span>{deliveryPerson.vehicleType}</span>
            </div>
          </div>
          
          <div className="availability-toggle">
            <button 
              className={`toggle-btn ${isAvailable ? 'available' : 'not-available'}`}
              onClick={toggleAvailability}
            >
              {isAvailable ? 'Available' : 'Not Available'}
            </button>
          </div>
        </div>
        
        <div className="nav-menu">
          <div 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <span className="nav-icon"><FiHome /></span>
            Dashboard
          </div>
          <div 
            className={`nav-item ${currentView === 'deliveries' ? 'active' : ''}`}
            onClick={() => setCurrentView('deliveries')}
          >
            <span className="nav-icon"><FiPackage /></span>
            My Deliveries
            {deliveries.length > 0 && (
              <span className="notification-badge">{deliveries.length}</span>
            )}
          </div>
          <div 
            className={`nav-item ${currentView === 'notifications' ? 'active' : ''}`}
            onClick={() => setCurrentView('notifications')}
          >
            <span className="nav-icon"><FiBell /></span>
            Notifications
          </div>
          <div 
            className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
          >
            <span className="nav-icon"><FiSettings /></span>
            Profile
          </div>
          <div 
            className="nav-item"
            onClick={handleLogout}
          >
            <span className="nav-icon"><FiLogOut /></span>
            Logout
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {isLoading ? (
          <div className="loading-spinner">
            <FiLoader />
            <p>Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <FiAlertCircle />
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Dashboard View */}
            {currentView === 'dashboard' && (
              <>
                <div className="header">
                  <h2>Today's Overview</h2>
                  <div>
                    Status: <strong>{isAvailable ? 'Available' : 'Not Available'}</strong>
                  </div>
                </div>
                
                <div className="stats-cards">
                  <div className="stat-card">
                    <div className="stat-label">Assigned Today</div>
                    <div className="stat-value">{deliveries.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Pending Deliveries</div>
                    <div className="stat-value">
                      {deliveries.filter(d => ['assigned', 'out-for-delivery'].includes(d.status)).length}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Completed</div>
                    <div className="stat-value">
                      {deliveries.filter(d => d.status === 'delivered').length}
                    </div>
                  </div>
                </div>
                
                <h3>Current Deliveries</h3>
                <div className="delivery-list">
                  {deliveries.slice(0, 3).map(delivery => (
                    <div key={delivery._id} className="delivery-item">
                      <div className="delivery-info">
                        <h3>Order #{delivery._id.slice(-6).toUpperCase()}</h3>
                        <p>{delivery.customer?.name || 'Customer'}</p>
                        <div className="delivery-meta">
                          <span><FiMapPin /> {delivery.deliveryAddress?.substring(0, 30)}...</span>
                          <span><FiClock /> Due: {new Date(delivery.deliveryTime).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <div>
                        <span className={`delivery-status status-${delivery.status}`}>
                          {delivery.status.toUpperCase()}
                        </span>
                        <button 
                          className="action-button view-button"
                          onClick={() => {
                            setCurrentOrder(delivery);
                            setCurrentView('order-details');
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Deliveries List View */}
            {currentView === 'deliveries' && (
              <>
                <div className="header">
                  <h2>My Deliveries</h2>
                  <select onChange={(e) => {
                    // Filter deliveries by status
                    const filtered = deliveries.filter(d => 
                      e.target.value === 'all' ? true : d.status === e.target.value
                    );
                    setDeliveries(filtered);
                  }}>
                    <option value="all">All Deliveries</option>
                    <option value="assigned">Pending</option>
                    <option value="out-for-delivery">In Progress</option>
                    <option value="delivered">Completed</option>
                  </select>
                </div>
                
                <div className="delivery-list">
                  {deliveries.map(delivery => (
                    <div key={delivery._id} className="delivery-item">
                      <div className="delivery-info">
                        <h3>Order #{delivery._id.slice(-6).toUpperCase()}</h3>
                        <p><FiUser /> {delivery.customer?.name || 'Customer'}</p>
                        <div className="delivery-meta">
                          <span><FiMapPin /> {delivery.deliveryAddress?.substring(0, 30)}...</span>
                          <span><FiClock /> {new Date(delivery.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <span className={`delivery-status status-${delivery.status}`}>
                          {delivery.status.toUpperCase()}
                        </span>
                        <button 
                          className="action-button view-button"
                          onClick={() => {
                            setCurrentOrder(delivery);
                            setCurrentView('order-details');
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Order Details View */}
            {currentView === 'order-details' && currentOrder && (
              <>
                <div className="header">
                  <h2>Order Details - #{currentOrder._id.slice(-6).toUpperCase()}</h2>
                  <button 
                    className="action-button secondary-button"
                    onClick={() => setCurrentView('deliveries')}
                  >
                    Back to List
                  </button>
                </div>
                
                <div className="order-details">
                  <div className="order-header">
                    <div>
                      <h3>
                        Delivery Status: 
                        <span className={`delivery-status status-${currentOrder.status}`}>
                          {currentOrder.status.toUpperCase()}
                        </span>
                      </h3>
                      <p>
                        <FiClock /> Deadline: {new Date(currentOrder.deliveryTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p><FiTruck /> Vehicle: {deliveryPerson.vehicleType}</p>
                    </div>
                  </div>
                  
                  <div className="customer-info">
                    <div className="customer-avatar">
                      <FiUser />
                    </div>
                    <div>
                      <h3>{currentOrder.customer?.name || 'Customer'}</h3>
                      <p><FiPhone /> {currentOrder.customer?.phone || 'No phone provided'}</p>
                      <button 
                        className="action-button secondary-button"
                        onClick={() => window.location.href = `tel:${currentOrder.customer?.phone}`}
                      >
                        Call Customer
                      </button>
                    </div>
                  </div>
                  
                  <h4>Delivery Address</h4>
                  <p>{currentOrder.deliveryAddress}</p>
                  <button 
                    className="action-button primary-button"
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentOrder.deliveryAddress)}`,
                        '_blank'
                      );
                    }}
                  >
                    Open Navigation
                  </button>
                  
                  <div className="delivery-map">
                    <p>Map view would show directions to: {currentOrder.deliveryAddress}</p>
                  </div>
                  
                  <div className="items-list">
                    <h4>Items to Deliver</h4>
                    {currentOrder.items?.map((item, index) => (
                      <div key={index} className="item-row">
                        <span>{item.name}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  {currentOrder.specialInstructions && (
                    <div className="delivery-notes">
                      <h4>Special Instructions</h4>
                      <p>{currentOrder.specialInstructions}</p>
                    </div>
                  )}
                  
                  <div className="action-buttons">
                    {currentOrder.status !== 'delivered' && (
                      <>
                        <button 
                          className="action-button success-button"
                          onClick={() => updateDeliveryStatus(currentOrder._id, 'delivered')}
                        >
                          <FiCheckCircle /> Mark as Delivered
                        </button>
                        <button 
                          className="action-button danger-button"
                          onClick={() => {
                            const reason = prompt('Enter reason for delivery issue:');
                            if (reason) {
                              updateDeliveryStatus(currentOrder._id, 'failed');
                            }
                          }}
                        >
                          <FiAlertCircle /> Report Issue
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DeliverUI;