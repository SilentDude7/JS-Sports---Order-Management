import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiArrowLeft, FiAlertCircle, FiLoader } from 'react-icons/fi';

const AssignDelivery = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigningIds, setAssigningIds] = useState({});
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeliveryOrders = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/delivery/delivery-orders');
        if (!res.ok) throw new Error('Failed to fetch delivery orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveryOrders();
  }, []);

  useEffect(() => {
    const fetchDeliveryPersonnel = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/delivery/available');
        if (!res.ok) throw new Error('Failed to fetch delivery personnel');
        const data = await res.json();
        // Normalize _id to id for each person
        const normalized = (data.deliveryPeople || []).map(p => ({
          ...p,
          id: p._id
        }));
        setDeliveryPersonnel(normalized);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDeliveryPersonnel();
  }, []);

  const assignDeliveryPerson = useCallback(async (orderId, deliveryPersonId) => {
    const key = `${orderId}-${deliveryPersonId}`;
    console.log('Assigning:', key); // DEBUG: Track calls
    try {
      setAssigningIds(prev => ({ ...prev, [key]: true }));
      setError(null);

      const response = await fetch('http://localhost:3000/api/delivery/assign-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, deliveryPersonId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Assignment failed');

      setOrders(prev => prev.filter(o => o._id !== orderId));
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigningIds(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FiLoader className="text-4xl animate-spin text-blue-500" />
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md w-full border-l-4 border-red-500">
          <FiAlertCircle className="text-3xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6"
        >
          <FiArrowLeft /> Back to orders
        </button>

        {orders.map(order => (
          <div
            key={order._id}
            className="mb-8 bg-white rounded-xl shadow-md overflow-hidden"
            onClick={e => e.stopPropagation()} // Prevent event bubbling
          >
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Assign Delivery for Order #{order._id.slice(-6).toUpperCase()}
              </h1>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                  <FiPackage className="text-xl" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Order Details</h2>
                  <p className="text-gray-600">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''} •{' '}
                    Delivery to {order.customer?.address?.street || 'customer address'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Delivery Personnel</h3>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                  <FiAlertCircle /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deliveryPersonnel.map(person => {
                  const key = `${order._id}-${person.id}`;
                  const isAssigning = !!assigningIds[key];
                  return (
                    <div
                      key={person.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      onClick={e => e.stopPropagation()} // Prevent bubbling
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={person.image}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{person.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>⭐ {person.rating}</span>
                            <span>•</span>
                            <span>{person.deliveries} deliveries</span>
                            <span>•</span>
                            <span>{person.vehicle}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          assignDeliveryPerson(order._id, person.id);
                        }}
                        disabled={isAssigning}
                        className={`mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors ${
                          isAssigning ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isAssigning ? 'Assigning...' : 'Assign to this order'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-center text-gray-500 mt-12">No pending orders for delivery.</p>
        )}
      </div>
    </div>
  );
};

export default AssignDelivery;
