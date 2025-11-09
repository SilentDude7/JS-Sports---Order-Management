import React, { useState } from 'react';
import { RiDeleteBin3Line } from 'react-icons/ri';

const CartContents = () => {
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

  const handleDelete = (productId) => {
    const updatedCart = cartProducts.filter(product => product.productId !== productId);
    setCartProducts(updatedCart);
  };

  return (
    <div className="p-4">
      {cartProducts.map((product, index) => (
        <div key={index} className="flex items-start justify-between py-4 border-b">
          {/* Product Image */}
          <div className="flex items-start gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded mr-4"
            />

            {/* Product Info */}
            <div>
              <h3 className="text-md font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600">Size: {product.size}</p>
              <p className="text-sm font-medium text-green-700">${product.price.toLocaleString()}</p>

              <div className='flex items-center mt-2'>
                <button className='border rounded px-2 py-1 text-xl font-medium'>-</button>
                <span className='mx-4'> {product.quantity}</span>
                <button className='border rounded px-2 py-1 text-xl font-medium'>+</button>
              </div>
            </div>

            {/* Delete Button */}
            <button onClick={() => handleDelete(product.productId)}>
              <RiDeleteBin3Line className='h-6 w-6 mt-2 text-red-600' />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartContents;
