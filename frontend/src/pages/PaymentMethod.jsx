import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCreditCard, FaPaypal, FaMoneyBillWave, FaCheck } from 'react-icons/fa';

const PaymentMethod = () => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const {
    cartProducts = [],
    subtotal = 0,
    shipping = 0,
    taxes = 0,
    discount = 0,
    total = 0,
  } = location.state || {};

  const paymentMethods = [
    { 
      name: 'Credit Card', 
      icon: <FaCreditCard className="payment-icon" />,
      color: '#4a6bdf'
    },
    { 
      name: 'PayPal', 
      icon: <FaPaypal className="payment-icon" />,
      color: '#3b7bbf'
    },
    { 
      name: 'Cash on Delivery', 
      icon: <FaMoneyBillWave className="payment-icon" />,
      color: '#28a745'
    }
  ];

  const handleConfirmPayment = () => {
    if (!selectedMethod) {
      alert("Please select a payment method");
      return;
    }

    navigate('/confirmation', {
      state: {
        cartItems: cartProducts,
        selectedMethod,
        subtotal,
        shipping,
        tax: taxes,
        discount,
        total
      }
    });
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        {/* Header */}
        <div className="payment-header">
          <h1>Complete Your Purchase</h1>
          <p>Select your preferred payment method</p>
        </div>

        {/* Payment Options */}
        <div className="payment-options">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className={`payment-option ${selectedMethod === method.name ? 'selected' : ''}`}
              style={{ borderColor: method.color }}
              onClick={() => setSelectedMethod(method.name)}
            >
              <div className="option-content">
                <div className="option-icon" style={{ color: method.color }}>
                  {method.icon}
                </div>
                <span>{method.name}</span>
              </div>
              {selectedMethod === method.name && (
                <div className="checkmark" style={{ backgroundColor: method.color }}>
                  <FaCheck />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${taxes.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row discount">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          className={`confirm-button ${!selectedMethod ? 'disabled' : ''}`}
          onClick={handleConfirmPayment}
          disabled={!selectedMethod}
        >
          <FaCheck className="button-icon" />
          Confirm Payment
        </button>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .payment-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
        }

        .payment-card {
          width: 100%;
          max-width: 500px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          padding: 30px;
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .payment-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .payment-header h1 {
          font-size: 24px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .payment-header p {
          color: #718096;
          font-size: 14px;
        }

        .payment-options {
          margin-bottom: 30px;
        }

        .payment-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          margin-bottom: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .payment-option:hover {
          border-color: #cbd5e0;
          transform: translateY(-2px);
        }

        .payment-option.selected {
          border-color: currentColor;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .option-content {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .option-icon {
          font-size: 20px;
        }

        .checkmark {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .order-summary {
          background: #f8fafc;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 25px;
        }

        .order-summary h3 {
          font-size: 16px;
          color: #4a5568;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
          color: #4a5568;
        }

        .summary-row.discount {
          color: #e53e3e;
        }

        .summary-row.total {
          font-weight: 600;
          color: #2d3748;
          font-size: 16px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed #e2e8f0;
        }

        .confirm-button {
          width: 100%;
          padding: 15px;
          background: #4a6bdf;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .confirm-button:hover {
          background: #3a56c4;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(74, 107, 223, 0.3);
        }

        .confirm-button.disabled {
          background: #cbd5e0;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .button-icon {
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .payment-card {
            padding: 20px;
          }
          
          .payment-option {
            padding: 12px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentMethod;