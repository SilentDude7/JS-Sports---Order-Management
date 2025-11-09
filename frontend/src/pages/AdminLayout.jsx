import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaBars, FaUser, FaBoxOpen, FaClipboardList, FaStore, FaSignOutAlt } from "react-icons/fa";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Inline logout function
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Mobile Top Bar */}
      <div className="flex md:hidden p-4 bg-gray-900 text-white z-20">
        <button onClick={toggleSidebar}>
          <FaBars size={24} />
        </button>
        <h1 className="ml-4 text-xl font-medium">Admin Dashboard</h1>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`bg-gray-900 w-64 min-h-screen text-white absolute md:relative transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:translate-x-0 md:static md:block z-20`}
      >
        <div className="p-6 bg-gray-800 h-full flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <NavLink
                to="/admin"
                className="text-2xl font-medium text-white hover:text-gray-300"
              >
                JS Sports
              </NavLink>
            </div>

            <h2 className="text-xl font-medium mb-6 text-center">Admin Dashboard</h2>

            <nav className="flex flex-col space-y-2">
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `py-3 px-4 rounded flex items-center space-x-2 transition-colors ${
                    isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                <FaUser />
                <span>Users</span>
              </NavLink>

              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  `py-3 px-4 rounded flex items-center space-x-2 transition-colors ${
                    isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                <FaBoxOpen />
                <span>Products</span>
              </NavLink>

              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  `py-3 px-4 rounded flex items-center space-x-2 transition-colors ${
                    isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                <FaClipboardList />
                <span>Orders</span>
              </NavLink>

              <NavLink
                to="/admin/suppliers"
                className={({ isActive }) =>
                  `py-3 px-4 rounded flex items-center space-x-2 transition-colors ${
                    isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                <FaStore />
                <span>Supplier Management</span>
              </NavLink>
            </nav>
          </div>

          <div>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center space-x-2 transition-colors"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <NavLink
                to="/"
                className="text-gray-300 hover:text-white py-2 px-4 rounded flex items-center space-x-2 transition-colors text-sm"
              >
                ← Back to Main Site
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
