import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from '../components/Common/Header';

const ProfilePage = () => {
  const { userId } = useParams();
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/orders/user/${userId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch orders");
        } else {
          setOrders(data);
          if (data.length > 0) {
            setUser({ 
              name: data[0].customer.name, 
              email: data[0].customer.email 
            });
          }
        }
      } catch (err) {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchOrders();
  }, [userId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800";
      case "Shipped": return "bg-blue-100 text-blue-800";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 text-xl font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
              <p className="text-gray-600 text-sm">Total Orders</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(order => order.status === "Delivered").length}
              </p>
              <p className="text-gray-600 text-sm">Completed</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-600">
                LKR {orders.reduce((total, order) => total + order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 0).toLocaleString()}
              </p>
              <p className="text-gray-600 text-sm">Total Spent</p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Order History</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                return (
                  <div key={order._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.image ? (
                            <img 
                            src={item.image} 
                            alt={item.product} 
                            className="w-full h-full object-cover"
                            />
                            ) : (
                            <span className="text-gray-500">📦</span>
                            )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.product}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900">LKR {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      <p className="text-lg font-bold text-gray-900">LKR {totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;