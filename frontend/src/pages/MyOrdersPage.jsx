import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate("/login");
    } else {
      setUser(userInfo);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    localStorage.removeItem('guestId'); 
    navigate('/login');
  };

  if (!user) return null; // Prevent rendering until user info is loaded

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          <div className="w-full md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{user?.name}</h1>
            <p className="text-lg text-gray-600 mb-4">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          <div className="w-full md:w-2/3 lg:w-3/4">
            <p className="text-gray-700">This section can later display order history or other user-related content.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
