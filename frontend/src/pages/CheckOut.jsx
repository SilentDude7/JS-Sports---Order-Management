import React, { useState } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Layout/Topbar';
import Navbar from '../components/Common/Navbar';

const Checkout = () => {
  const navigate = useNavigate();

  const [cartProducts, setCartProducts] = useState([
    {
      productId: 1,
      name: "Sports T-Shirt",
      size: "M",
      quantity: 1,
      price: 25,
      image: "https://picsum.photos/200?random=1"
    },
    {
      productId: 2,
      name: "Football Boots",
      size: "42",
      quantity: 1,
      price: 70,
      image: "https://picsum.photos/200?random=2"
    }
  ]);

  const shipping = 10;
  const taxes = 8;
  const discount = 5;

  const subtotal = cartProducts.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const total = subtotal + shipping + taxes - discount;

  const handleDelete = (productId) => {
    const updatedCart = cartProducts.filter(product => product.productId !== productId);
    setCartProducts(updatedCart);
  };

  const handleProceedToPayment = () => {
    navigate('/payment', {
      state: {
        cartProducts,
        subtotal,
        shipping,
        taxes,
        discount,
        total
      }
    });
  };

  return (
    <>
      <Topbar />
      <Navbar />
      <div className="checkout-container">
        <div className="checkout-content">
          <h1 className="checkout-title">Your Shopping Cart</h1>

          {cartProducts.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-content">
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything to your cart yet</p>
                <button 
                  className="continue-shopping-btn"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartProducts.map((product) => (
                  <div className="cart-item" key={product.productId}>
                    <div className="product-image-container">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100?text=Product+Image';
                        }}
                      />
                    </div>
                    <div className="product-details">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-size">Size: {product.size}</p>
                      <p className="product-price">${product.price.toFixed(2)}</p>
                      <div className="quantity-controls">
                        <button className="quantity-btn">-</button>
                        <span className="quantity">{product.quantity}</span>
                        <button className="quantity-btn">+</button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(product.productId)}
                      className="delete-btn"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <h3 className="summary-title">Order Summary</h3>
                
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Taxes</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="checkout-btn"
                >
                  Proceed to Payment
                  <FiArrowRight className="arrow-icon" />
                </button>

                <p className="checkout-note">
                  Shipping, taxes and discount codes calculated at checkout.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .checkout-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          padding: 30px;
        }

        .checkout-title {
          font-size: 28px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 30px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 15px;
        }

        .empty-cart {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          text-align: center;
        }

        .empty-cart-content h2 {
          font-size: 22px;
          color: #4a5568;
          margin-bottom: 10px;
        }

        .empty-cart-content p {
          color: #718096;
          margin-bottom: 20px;
        }

        .continue-shopping-btn {
          background: #4a6bdf;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .continue-shopping-btn:hover {
          background: #3a56c4;
          transform: translateY(-2px);
        }

        .cart-items {
          margin-bottom: 30px;
        }

        .cart-item {
          display: flex;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #edf2f7;
          position: relative;
        }

        .product-image-container {
          width: 120px;
          height: 120px;
          border-radius: 8px;
          overflow: hidden;
          margin-right: 20px;
          background: #f8fafc;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-details {
          flex: 1;
        }

        .product-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2d3748;
        }

        .product-size, .product-price {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 8px;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          margin-top: 10px;
        }

        .quantity-btn {
          width: 30px;
          height: 30px;
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .quantity {
          margin: 0 12px;
          min-width: 20px;
          text-align: center;
        }

        .delete-btn {
          background: none;
          border: none;
          color: #e53e3e;
          font-size: 20px;
          cursor: pointer;
          padding: 10px;
          margin-left: 20px;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          transform: scale(1.1);
        }

        .order-summary {
          background: #f8fafc;
          border-radius: 10px;
          padding: 25px;
          margin-top: 30px;
        }

        .summary-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #2d3748;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 15px;
          color: #4a5568;
        }

        .summary-row.discount {
          color: #e53e3e;
        }

        .summary-row.total {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px dashed #cbd5e0;
        }

        .checkout-btn {
          width: 100%;
          background: #4a6bdf;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          margin-top: 25px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
        }

        .checkout-btn:hover {
          background: #3a56c4;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 107, 223, 0.3);
        }

        .arrow-icon {
          transition: transform 0.3s;
        }

        .checkout-btn:hover .arrow-icon {
          transform: translateX(4px);
        }

        .checkout-note {
          font-size: 13px;
          color: #718096;
          text-align: center;
          margin-top: 15px;
        }

        @media (max-width: 768px) {
          .checkout-content {
            padding: 20px;
          }
          
          .cart-item {
            flex-direction: column;
            align-items: flex-start;
            padding: 15px 0;
          }
          
          .product-image-container {
            width: 100%;
            height: auto;
            aspect-ratio: 1/1;
            margin-bottom: 15px;
          }
          
          .delete-btn {
            position: absolute;
            top: 15px;
            right: 0;
          }
        }
      `}</style>
    </>
  );
};

export default Checkout;