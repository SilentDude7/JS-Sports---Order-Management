// src/context/CartContext.js
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartProducts, setCartProducts] = useState([]);

  const addToCart = (product) => {
    setCartProducts((prev) => {
      const exists = prev.find(p => p.productId === product.productId);
      if (exists) {
        return prev.map(p =>
          p.productId === product.productId
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartProducts((prev) => prev.filter(p => p.productId !== productId));
  };

  return (
    <CartContext.Provider value={{ cartProducts, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
