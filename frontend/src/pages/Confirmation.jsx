import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle, FiAlertCircle, FiLoader, FiHome } from 'react-icons/fi';

const Confirmation = () => {
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState({
    saved: false,
    error: null,
    loading: false
  });
  const submissionLock = useRef(false);
  const requestId = useRef(null);

  const handleReturnHome = () => {
    navigate('/');
  };

  useEffect(() => {
    const submitOrder = async () => {
      if (submissionLock.current) return;
      
      submissionLock.current = true;
      requestId.current = crypto.randomUUID();
      setOrderStatus({ saved: false, error: null, loading: true });

      // Hardcoded order data matching your example
      const orderData = {
        customer: "507f1f77bcf86cd799439010", // Hardcoded customer ID
        items: [
          {
            product: "Jacket", // Hardcoded product ID
            quantity: 2,
            price: 29.99,
            image: "https://tse2.mm.bing.net/th/id/OIP.bO4pS4CxtlOHb0LsEMiIWwHaIf?rs=1&pid=ImgDetMain&o=7&rm=3",
            size: "M"
          },
          {
            product: "Football shoes", // Hardcoded product ID
            quantity: 1,
            price: 49.99,
            image: "https://tse2.mm.bing.net/th/id/OIP.pJDfuDYligaEEPWOy4AbWAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
            size: "L"
          }
        ],
        paymentMethod: "credit_card",
        subtotal: 109.97,
        shipping: 5.99,
        tax: 8.50,
        discount: 10.00,
        total: 114.46,
        orderDate: new Date("2025-08-12T12:00:00.000Z"),
        status: "placed",
        statusHistory: [{ status: "placed" }],
        requestId: requestId.current
      };

      try {
        const response = await axios.post('http://localhost:3000/api/orders/save-order', orderData, {
          headers: {
            'X-Request-ID': requestId.current,
            'Content-Type': 'application/json'
          }
        });

        setOrderStatus({
          saved: true,
          error: null,
          loading: false
        });
      } catch (err) {
        console.error('Order submission error:', err.response?.data);
        setOrderStatus({
          saved: false,
          error: err.response?.data?.error || err.response?.data?.message || 'Order submission failed. Please try again.',
          loading: false
        });
        submissionLock.current = false;
      }
    };

    const timer = setTimeout(submitOrder, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="confirmation-container">
      {/* Order Status Header */}
      <div className={`status-header ${orderStatus.loading ? 'loading' : ''} ${orderStatus.error ? 'error' : ''} ${orderStatus.saved ? 'success' : ''}`}>
        {orderStatus.loading && (
          <>
            <FiLoader className="spin-animation" />
            <h1>Processing Your Order</h1>
          </>
        )}
        {orderStatus.saved && (
          <>
            <FiCheckCircle />
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
          </>
        )}
        {orderStatus.error && (
          <>
            <FiAlertCircle />
            <h1>Order Failed</h1>
            <p>{orderStatus.error}</p>
          </>
        )}
      </div>

      {/* Payment Method */}
      <div className="payment-method">
        <div className="method-card">
          <span>Payment Method</span>
          <strong>credit_card</strong>
        </div>
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <h2>
          <span className="summary-icon">🛍️</span>
          Order Summary
        </h2>
        
        <div className="items-list">
          {/* Hardcoded items display */}
          <div className="product-card">
            <div className="product-image-container">
              <img 
                src="https://example.com/product1.jpg" 
                alt="Product 1" 
                className="product-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                }}
              />
            </div>
            <div className="product-details">
              <h3>Product 1</h3>
              <p className="product-size">Size: M</p>
              <p className="product-price">
                $29.99 × 2 = <strong>$59.98</strong>
              </p>
            </div>
          </div>
          <div className="product-card">
            <div className="product-image-container">
              <img 
                src="https://example.com/product2.jpg" 
                alt="Product 2" 
                className="product-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                }}
              />
            </div>
            <div className="product-details">
              <h3>Product 2</h3>
              <p className="product-size">Size: L</p>
              <p className="product-price">
                $49.99 × 1 = <strong>$49.99</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Order Totals */}
        <div className="order-totals">
          <div className="total-row">
            <span>Subtotal</span>
            <span>$109.97</span>
          </div>
          <div className="total-row">
            <span>Shipping</span>
            <span>$5.99</span>
          </div>
          <div className="total-row">
            <span>Tax</span>
            <span>$8.50</span>
          </div>
          <div className="total-row discount">
            <span>Discount</span>
            <span>-$10.00</span>
          </div>
          <div className="grand-total">
            <span>Total</span>
            <span>$114.46</span>
          </div>
        </div>
      </div>

      {/* Order Footer */}
      <div className="order-footer">
        {orderStatus.error && (
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        )}
        {orderStatus.saved && (
          <div className="confirmation-message">
            <p>We've sent the order details to your email</p>
            <small>Order ID: {requestId.current?.substring(0, 8).toUpperCase()}</small>
          </div>
        )}
        <button className="home-button" onClick={handleReturnHome}>
          <FiHome /> Return to Home
        </button>
      </div>
    </div>
  );
};

// CSS Styles (add to your stylesheet)
const styles = `
  .confirmation-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .status-header {
    text-align: center;
    padding: 2rem 0;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .status-header svg {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .status-header.loading {
    background: #f8f9fa;
  }

  .status-header.success {
    background: #f0f9f0;
    color: #2e7d32;
  }

  .status-header.error {
    background: #ffebee;
    color: #c62828;
  }

  .status-header h1 {
    margin: 0.5rem 0;
    font-weight: 600;
  }

  .spin-animation {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% { transform: rotate(360deg); }
  }

  .payment-method {
    margin-bottom: 2rem;
  }

  .method-card {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    display: inline-block;
  }

  .method-card span {
    display: block;
    font-size: 0.9rem;
    color: #6c757d;
  }

  .method-card strong {
    font-size: 1.1rem;
    color: #212529;
  }

  .order-summary h2 {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #212529;
  }

  .summary-icon {
    margin-right: 0.5rem;
  }

  .items-list {
    margin-bottom: 2rem;
  }

  .product-card {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem 0;
    border-bottom: 1px solid #e9ecef;
  }

  .product-image-container {
    width: 100px;
    height: 100px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    background: #f8f9fa;
  }

  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-details {
    flex-grow: 1;
  }

  .product-details h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
  }

  .product-size {
    color: #6c757d;
    margin: 0.25rem 0;
    font-size: 0.9rem;
  }

  .product-price {
    margin: 0.5rem 0 0 0;
    color: #212529;
  }

  .order-totals {
    border-top: 1px solid #e9ecef;
    padding-top: 1.5rem;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    color: #495057;
  }

  .total-row.discount {
    color: #c62828;
  }

  .grand-total {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px dashed #dee2e6;
    font-size: 1.2rem;
    font-weight: 600;
    color: #212529;
  }

  .order-footer {
    margin-top: 2rem;
    text-align: center;
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
    margin-bottom: 1rem;
  }

  .retry-button:hover {
    background: #c82333;
  }

  .home-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .home-button:hover {
    background: #0069d9;
  }

  .confirmation-message {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .confirmation-message small {
    display: block;
    margin-top: 0.5rem;
    color: #adb5bd;
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60vh;
  }

  .empty-state-content {
    text-align: center;
    max-width: 400px;
  }

  .empty-icon {
    font-size: 3rem;
    color: #adb5bd;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .confirmation-container {
      padding: 1.5rem;
      margin: 1rem;
    }

    .product-card {
      gap: 1rem;
    }

    .product-image-container {
      width: 80px;
      height: 80px;
    }
  }
`;

// Add styles to the head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Confirmation;