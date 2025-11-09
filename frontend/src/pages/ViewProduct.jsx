import React, { useEffect, useState } from 'react';
import { 
  FiShoppingBag, 
  FiAlertCircle, 
  FiLoader, 
  FiCalendar, 
  FiDollarSign, 
  FiPackage,
  FiTruck,
  FiHome,
  FiCheckCircle,
  FiBox,
  FiCreditCard,
  FiMapPin,
  FiPhone,
  FiUser,
  FiXCircle
} from 'react-icons/fi';

const statusSequence = [
  'placed',
  'scheduled',
  'dispatched',
  'out',
  'delivering',
  'delivered',
  'failed'
];

const ViewProduct = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3000/api/orders/get-orders')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not OK');
        }
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Failed to fetch orders');
        setLoading(false);
      });
  }, []);

  const getStatusInfo = (status) => {
    const statusInfo = {
      'placed': {
        title: 'Placed',
        description: 'Your order has been placed',
        icon: <FiShoppingBag />,
        color: '#17a2b8'
      },
      'scheduled': {
        title: 'Scheduled',
        description: 'Your order is scheduled',
        icon: <FiCalendar />,
        color: '#ffc107'
      },
      'cancelled': {
        title: 'Cancelled',
        description: 'Your order has been cancelled',
        icon: <FiXCircle />,
        color: '#6c757d'
      },
      'dispatched': {
        title: 'Dispatched',
        description: 'Your order has been dispatched',
        icon: <FiTruck />,
        color: '#007bff'
      },
      'out': {
        title: 'Out for Delivery',
        description: 'Your order is out for delivery',
        icon: <FiTruck />,
        color: '#6610f2'
      },
      'delivering': {
        title: 'Delivering',
        description: 'Your order is being delivered',
        icon: <FiTruck />,
        color: '#6610f2'
      },
      'delivered': {
        title: 'Delivered',
        description: 'Your order has been delivered',
        icon: <FiCheckCircle />,
        color: '#28a745'
      },
      'failed': {
        title: 'Failed',
        description: 'Delivery failed',
        icon: <FiAlertCircle />,
        color: '#dc3545'
      },
      'returned': {
        title: 'Returned',
        description: 'Order was returned',
        icon: <FiBox />,
        color: '#6c757d'
      }
    };
    return statusInfo[status] || statusInfo['placed'];
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/orders/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          newStatus: 'cancelled'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'cancelled' } 
            : order
        )
      );
      
      setError(null);
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order');
    }
  };

  const toggleOrderExpansion = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <FiLoader className="spin-animation" />
        <p>Loading your purchases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <FiAlertCircle />
        <p>{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <FiShoppingBag />
        <h2>No purchases found</h2>
        <p>Your purchased items will appear here</p>
      </div>
    );
  }

  return (
    <div className="view-products-container">
      <h1>
        <FiShoppingBag /> Order History
      </h1>

      <div className="orders-grid">
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const isExpanded = expandedOrder === order._id;

          return (
            <div key={order._id} className="order-card">
              <div className="order-summary" onClick={() => toggleOrderExpansion(order._id)}>
                <div className="order-meta">
                  <div className="order-id-date">
                    <span className="order-id">Order #{order._id.substring(0, 8).toUpperCase()}</span>
                    <span className="order-date">
                      <FiCalendar /> {new Date(order.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="order-status-badge" style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}>
                    {statusInfo.icon}
                    <span>{statusInfo.title}</span>
                  </div>
                </div>
                
                <div className="order-preview">
                  <div className="order-items-preview">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="preview-item">
                        <img 
                          src={item.image || 'https://via.placeholder.com/50?text=No+Image'} 
                          alt={item.product}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                          }}
                        />
                        <span>{item.product}{item.size ? ` (${item.size})` : ''}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="preview-more">+{order.items.length - 2} more items</div>
                    )}
                  </div>
                  
                  <div className="order-total-preview">
                    <FiDollarSign /> {formatCurrency(order.total)}
                  </div>
                </div>
                
                <div className="expand-indicator">
                  {isExpanded ? '▲' : '▼'}
                </div>
              </div>

              {isExpanded && (
                <div className="order-details">
                  <div className="details-section">
                    <h3><FiPackage /> Order Details</h3>
                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="product-card">
                          <div className="product-image-container">
                            <img
                              src={item.image || 'https://via.placeholder.com/150?text=No+Image'}
                              alt={item.product}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="product-details">
                            <h4>{item.product}</h4>
                            {item.size && <p className="product-size"><FiPackage /> Size: {item.size}</p>}
                            <div className="product-info">
                              <p>Price: <strong>{formatCurrency(item.price)}</strong></p>
                              <p>Quantity: <strong>{item.quantity}</strong></p>
                              <p>Subtotal: <strong>{formatCurrency(item.price * item.quantity)}</strong></p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="details-grid">
                    <div className="details-section">
                      <h3><FiCreditCard /> Payment Information</h3>
                      <div className="info-item">
                        <span>Payment Method:</span>
                        <span>{order.paymentMethod}</span>
                      </div>
                      <div className="info-item">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="info-item discount">
                          <span>Discount:</span>
                          <span>-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <span>Shipping:</span>
                        <span>{formatCurrency(order.shipping)}</span>
                      </div>
                      <div className="info-item">
                        <span>Tax:</span>
                        <span>{formatCurrency(order.tax)}</span>
                      </div>
                      <div className="info-item total">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>

                    <div className="details-section">
                      <h3><FiUser /> Delivery Information</h3>
                      <div className="info-item">
                        <span><FiMapPin /> Address:</span>
                        <span>{order.deliveryAddress}</span>
                      </div>
                      <div className="info-item">
                        <span><FiPhone /> Phone:</span>
                        <span>{order.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shipping-status" style={{ backgroundColor: `${statusInfo.color}10` }}>
                    <div className="status-icon" style={{ color: statusInfo.color }}>
                      {statusInfo.icon}
                    </div>
                    <div className="status-details">
                      <h3 style={{ color: statusInfo.color }}>{statusInfo.title}</h3>
                      <p>{statusInfo.description}</p>
                    </div>
                  </div>

                  {(order.status === 'placed' || order.status === 'scheduled') && !order.statusHistory?.some(h => h.status === 'cancelled') && (
                    <div className="cancel-order-container">
                      <button 
                        className="cancel-order-button"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}

                  <div className="status-history-timeline">
                    <h3>Order Status History</h3>
                    <div className="timeline-steps-container">
                      {statusSequence.map((status, index) => {
                        if ((order.status === 'delivered' && status === 'failed') || 
                            (order.status === 'failed' && status === 'delivered') ||
                            (order.status === 'cancelled')) {
                          return null;
                        }

                        const statusEntry = order.statusHistory?.find(h => h.status === status);
                        const isActive = order.status === status;
                        const isCompleted = statusSequence.indexOf(order.status) > index;
                        
                        if (!statusEntry && !(isActive || isCompleted)) return null;

                        const info = getStatusInfo(status);
                        const isNew = statusEntry?.status === order.status;

                        return (
                          <div
                            key={status}
                            className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isNew ? 'new-status' : ''}`}
                          >
                            <div
                              className="step-icon"
                              style={{ 
                                backgroundColor: isActive ? info.color : (isCompleted ? '#28a745' : '#e9ecef'),
                                color: isActive ? 'white' : (isCompleted ? 'white' : '#666')
                              }}
                            >
                              {info.icon}
                            </div>
                            <div className="step-label" style={{ color: isActive ? info.color : (isCompleted ? '#28a745' : '#666') }}>
                              {info.title}
                            </div>
                            {statusEntry && <small>{new Date(statusEntry.timestamp).toLocaleString()}</small>}
                          </div>
                        );
                      })}

                      {order.status === 'cancelled' && (() => {
                        const cancelledEntry = order.statusHistory?.find(h => h.status === 'cancelled');
                        return cancelledEntry ? (
                          <small>{new Date(cancelledEntry.timestamp).toLocaleString()}</small>
                        ) : (
                          <small>Cancelled (timestamp unavailable)</small>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// CSS Styles
const styles = `
  .view-products-container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .view-products-container h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #2c3e50;
    font-size: 2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .orders-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .order-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  .order-card:hover {
    transform: translateY(-4px);
  }

  .order-summary {
    padding: 1.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .order-summary:hover {
    background-color: #f8f9fa;
  }

  .order-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .order-id-date {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .order-id {
    font-weight: 600;
    color: #2c3e50;
    font-size: 1.1rem;
  }

  .order-date {
    font-size: 0.85rem;
    color: #6c757d;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .order-status-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .order-preview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
  }

  .order-items-preview {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .preview-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .preview-item img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 6px;
  }

  .preview-more {
    font-size: 0.85rem;
    color: #6c757d;
    margin-left: 0.5rem;
  }

  .order-total-preview {
    font-weight: 600;
    color: #2e7d32;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 1.1rem;
  }

  .expand-indicator {
    text-align: center;
    color: #6c757d;
    font-size: 0.8rem;
  }

  .order-details {
    border-top: 1px solid #e9ecef;
    padding: 1.5rem;
  }

  .details-section {
    margin-bottom: 2rem;
  }

  .details-section h3 {
    margin: 0 0 1rem 0;
    color: #495057;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f3f4;
  }

  .info-item.discount {
    color: #dc3545;
  }

  .info-item.total {
    font-weight: 600;
    font-size: 1.1rem;
    border-bottom: none;
    border-top: 2px solid #e9ecef;
    margin-top: 0.5rem;
  }

  .product-card {
    display: flex;
    gap: 1.5rem;
    padding: 1rem 0;
    border-bottom: 1px solid #e9ecef;
  }

  .product-card:last-child {
    border-bottom: none;
  }

  .product-image-container {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    background: #f8f9fa;
  }

  .product-image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-details {
    flex-grow: 1;
  }

  .product-details h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    color: #2c3e50;
  }

  .product-size {
    color: #6c757d;
    margin: 0.25rem 0;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .product-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .product-info p {
    margin: 0;
    font-size: 0.9rem;
    color: #495057;
  }

  .product-info strong {
    color: #2c3e50;
  }

  .shipping-status {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    margin: 1rem 0;
    border-radius: 8px;
    gap: 1rem;
  }

  .status-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .status-details h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
  }

  .status-details p {
    margin: 0;
    color: #495057;
  }

  .cancel-order-container {
    display: flex;
    justify-content: flex-end;
    margin: 1rem 0;
  }

  .cancel-order-button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .cancel-order-button:hover {
    background: #c82333;
  }

  .status-history-timeline {
    width: 100%;
    overflow-x: auto;
    padding: 20px 0;
    margin: 20px 0;
    border-top: 1px solid #eee;
  }

  .status-history-timeline h3 {
    margin-bottom: 1rem;
    color: #495057;
  }

  .timeline-steps-container {
    display: flex !important;
    flex-direction: row !important;
    justify-content: flex-start;
    align-items: center;
    gap: 30px;
    min-width: max-content;
    position: relative;
  }

  .timeline-steps-container::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 2px;
    background: #e9ecef;
    z-index: 1;
  }

  .timeline-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    min-width: 80px;
  }

  .timeline-step.completed .step-icon {
    background: #28a745 !important;
    color: white !important;
  }

  .timeline-step.active .step-icon {
    background: #007bff;
    color: white;
    transform: scale(1.1);
  }

  .step-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
  }

  .step-label {
    font-size: 0.75rem;
    text-align: center;
    color: #6c757d;
    font-weight: 500;
  }

  .timeline-step small {
    font-size: 0.65rem;
    color: #6c757d;
    text-align: center;
    margin-top: 0.25rem;
  }

  .loading-state, .error-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    text-align: center;
  }

  .loading-state svg {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #6c757d;
  }

  .error-state svg {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #dc3545;
  }

  .empty-state svg {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #adb5bd;
  }

  .error-state p {
    color: #dc3545;
    margin-bottom: 1rem;
  }

  .empty-state h2 {
    color: #6c757d;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    color: #adb5bd;
  }

  .retry-button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .retry-button:hover {
    background: #c82333;
  }

  .spin-animation {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .view-products-container {
      padding: 0 1rem;
    }

    .order-meta {
      flex-direction: column;
      gap: 1rem;
    }

    .order-preview {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }

    .product-card {
      flex-direction: column;
      gap: 1rem;
    }

    .product-image-container {
      width: 100%;
      height: 200px;
    }

    .status-history-timeline {
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem 0;
    }

    .timeline-steps-container::before {
      display: none;
    }

    .timeline-step {
      flex: 0 0 calc(50% - 0.5rem);
    }
  }
`;

// Inject styles once on component load
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default ViewProduct;