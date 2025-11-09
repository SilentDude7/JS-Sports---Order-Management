import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiPieChart, 
  FiShoppingCart, 
  FiMail, 
  FiBell,
  FiMenu,
  FiX,
  FiSearch,
  FiUser,
  FiDollarSign,
  FiPackage,
  FiChevronDown,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiTruck,
  FiMapPin,     // For tracking
  FiList,       // For partner list
  FiCheckCircle, // For assignment icon
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const navigate = useNavigate();
  const ordersCount = useOrdersCount(); // Call the hook

function useOrdersCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch('http://localhost:3000/api/count')
      .then(res => res.json())
      .then(data => setCount(data.count))
      .catch(console.error);
  }, []);

  return count;
}


  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 7L12 12L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Admin Panel</h2>
          </div>
          <button className="close-btn" onClick={toggleSidebar}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              <FiHome className="icon" />
              <span>Dashboard</span>
            </li>
            <li 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              <FiUsers className="icon" />
              <span>Users</span>
            </li>
            <li 
              className={activeTab === 'products' ? 'active' : ''}
              onClick={() => setActiveTab('products')}
            >
              <FiShoppingCart className="icon" />
              <span>Products</span>
            </li>
            <li 
  className={activeTab === 'delivery' ? 'active' : ''}
  onClick={() => setActiveTab('delivery')}
>
  <FiTruck className="icon" />
  <span>Delivery</span>
</li>
            <li 
              className={activeTab === 'analytics' ? 'active' : ''}
              onClick={() => setActiveTab('analytics')}
            >
              <FiPieChart className="icon" />
              <span>Analytics</span>
            </li>
            <li 
              className={activeTab === 'messages' ? 'active' : ''}
              onClick={() => setActiveTab('messages')}
            >
              <FiMail className="icon" />
              <span>Messages</span>
              <span className="badge">5</span>
            </li>
            <li 
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings className="icon" />
              <span>Settings</span>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <img 
              src="https://randomuser.me/api/portraits/women/44.jpg" 
              alt="Admin User" 
              className="profile-img"
            />
            <div className="user-info">
              <h4>Jane Doe</h4>
              <p>Admin</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation */}
        <header className="top-nav">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
          
          <div className="nav-right">
            <button className="notification-btn">
              <FiBell />
              <span className="badge">3</span>
            </button>
            
            <div className="user-menu" onClick={toggleUserDropdown}>
              <img 
                src="https://randomuser.me/api/portraits/women/44.jpg" 
                alt="Admin User" 
                className="profile-img"
              />
              <span className="user-name">Jane Doe</span>
              <FiChevronDown className={`dropdown-icon ${userDropdownOpen ? 'open' : ''}`} />
              
              {userDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-item">
                    <FiUser className="dropdown-icon" />
                    <span>Profile</span>
                  </div>
                  <div className="dropdown-item">
                    <FiSettings className="dropdown-icon" />
                    <span>Settings</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item">
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <div className="breadcrumb">
              <span>Home</span>
              <span>/</span>
              <span className="active">{activeTab}</span>
            </div>
          </div>
          
          {/* Dashboard Cards */}
          {activeTab === 'dashboard' && (
            <>
              <div className="dashboard-cards">
                <div className="card">
                  <div className="card-icon user">
                    <FiUsers />
                  </div>
                  <div className="card-content">
                    <h3>Total Users</h3>
                    <p className="stat">1,254</p>
                    <p className="trend up">
                      <FiTrendingUp className="trend-icon" />
                      <span>12% from last month</span>
                    </p>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-icon revenue">
                    <FiDollarSign />
                  </div>
                  <div className="card-content">
                    <h3>Revenue</h3>
                    <p className="stat">$24,780</p>
                    <p className="trend up">
                      <FiTrendingUp className="trend-icon" />
                      <span>8% from last month</span>
                    </p>
                  </div>
                </div>
                
<div 
  className="card clickable" 
  onClick={() => navigate('/admin-order')}
>
  <div className="card-icon orders">
    <FiShoppingCart />
  </div>
  <div className="card-content">
    <h3>Orders</h3>
    <p className="stat">{ordersCount}</p>
    <p className="trend down">
      <FiTrendingDown className="trend-icon" />
      <span>3% from last month</span>
    </p>
  </div>
</div>

                
                <div className="card">
                  <div className="card-icon products">
                    <FiPackage />
                  </div>
                  <div className="card-content">
                    <h3>Active Products</h3>
                    <p className="stat">128</p>
                    <p className="trend up">
                      <FiTrendingUp className="trend-icon" />
                      <span>5% from last month</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Monthly Overview</h3>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <span className="color users"></span>
                      <span>Users</span>
                    </div>
                    <div className="legend-item">
                      <span className="color revenue"></span>
                      <span>Revenue</span>
                    </div>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <p>Chart visualization would appear here</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'delivery' && (
  <div className="delivery-container">
    <h2 className="delivery-title">Delivery & Logistics</h2>
    
    <div className="delivery-cards">
      {/* Assign Delivery Card */}
      <div 
        className="card clickable" 
        onClick={() => navigate('/assign-deliver')} // or your desired navigation
      >
        <div className="card-icon assign">
          <FiCheckCircle />
        </div>
        <div className="card-content">
          <h3>Assign Delivery</h3>
          <p className="description">Assign orders to delivery partners</p>
        </div>
      </div>
      
      {/* Track Status Card */}
      <div 
        className="card clickable" 
        onClick={() => navigate('/track-status')}
      >
        <div className="card-icon track">
          <FiMapPin />
        </div>
        <div className="card-content">
          <h3>Track Status</h3>
          <p className="description">Track order delivery status</p>
        </div>
      </div>
      
      {/* Delivery Partner List Card */}
      <div 
        className="card clickable" 
        onClick={() => navigate('/delivery-partners')}
      >
        <div className="card-icon partners">
          <FiList />
        </div>
        <div className="card-content">
          <h3>Delivery Partners</h3>
          <p className="description">View and manage delivery partners</p>
        </div>
      </div>
    </div>
  </div>
)}
          
          {/* Data Table (example for Users tab) */}
          {activeTab === 'users' && (
            <div className="data-table-container">
              <div className="table-header">
                <h3>User Management</h3>
                <button className="primary-btn">
                  <FiPlus className="btn-icon" />
                  <span>Add User</span>
                </button>
              </div>
              
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#1001</td>
                      <td>
                        <div className="user-cell">
                          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
                          <span>John Smith</span>
                        </div>
                      </td>
                      <td>john@example.com</td>
                      <td>Admin</td>
                      <td><span className="status active">Active</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit">
                            <FiEdit2 />
                          </button>
                          <button className="action-btn delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>#1002</td>
                      <td>
                        <div className="user-cell">
                          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" />
                          <span>Sarah Johnson</span>
                        </div>
                      </td>
                      <td>sarah@example.com</td>
                      <td>Editor</td>
                      <td><span className="status active">Active</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit">
                            <FiEdit2 />
                          </button>
                          <button className="action-btn delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>#1003</td>
                      <td>
                        <div className="user-cell">
                          <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="User" />
                          <span>Michael Brown</span>
                        </div>
                      </td>
                      <td>michael@example.com</td>
                      <td>Customer</td>
                      <td><span className="status inactive">Inactive</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit">
                            <FiEdit2 />
                          </button>
                          <button className="action-btn delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="table-footer">
                <div className="table-info">
                  Showing 1 to 3 of 3 entries
                </div>
                <div className="pagination">
                  <button className="page-btn disabled">Previous</button>
                  <button className="page-btn active">1</button>
                  <button className="page-btn">2</button>
                  <button className="page-btn">Next</button>
                </div>
              </div>
            </div>
          )}
          
          {/* Other tab content would go here */}
        </div>
      </div>
      
      <style jsx>{`
        /* Admin Dashboard CSS */
        :root {
          --primary-color: #4361ee;
          --primary-light: #e6ecfe;
          --secondary-color: #3f37c9;
          --dark-color: #1a1a2e;
          --light-color: #f8f9fa;
          --success-color: #4cc9f0;
          --warning-color: #f8961e;
          --danger-color: #f72585;
          --gray-color: #6c757d;
          --light-gray: #e9ecef;
          --sidebar-width: 280px;
          --sidebar-collapsed-width: 80px;
          --transition: all 0.3s ease;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .admin-dashboard {
          display: flex;
          min-height: 100vh;
          background-color: #f5f7fb;
          color: var(--dark-color);
        }

        /* Sidebar Styles */
        .sidebar {
          width: var(--sidebar-width);
          background: white;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .sidebar.closed {
          width: var(--sidebar-collapsed-width);
        }

        .sidebar.closed .sidebar-header h2,
        .sidebar.closed .sidebar-nav span,
        .sidebar.closed .user-info,
        .sidebar.closed .badge {
          display: none;
        }

        .sidebar.closed .sidebar-nav li {
          justify-content: center;
          padding: 12px 0;
        }

        .sidebar-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--light-gray);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo svg {
          color: var(--primary-color);
        }

        .sidebar-header h2 {
          color: var(--primary-color);
          font-size: 1.3rem;
          white-space: nowrap;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--gray-color);
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
        }

        .close-btn:hover {
          background: var(--light-gray);
          color: var(--dark-color);
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
          overflow-y: auto;
        }

        .sidebar-nav ul {
          list-style: none;
        }

        .sidebar-nav li {
          padding: 12px 20px;
          margin: 5px 0;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: var(--transition);
          border-left: 3px solid transparent;
          color: var(--gray-color);
          white-space: nowrap;
          font-size: 0.95rem;
        }

        .sidebar-nav li:hover {
          background: var(--primary-light);
          color: var(--primary-color);
        }

        .sidebar-nav li.active {
          background: var(--primary-light);
          color: var(--primary-color);
          border-left: 3px solid var(--primary-color);
          font-weight: 500;
        }

        .sidebar-nav .icon {
          margin-right: 15px;
          font-size: 1.1rem;
          min-width: 20px;
        }

        .badge {
          background: var(--danger-color);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          margin-left: auto;
          font-weight: 500;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid var(--light-gray);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .profile-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-info h4 {
          font-size: 0.9rem;
          color: var(--dark-color);
          font-weight: 500;
        }

        .user-info p {
          font-size: 0.8rem;
          color: var(--gray-color);
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .top-nav {
          background: white;
          padding: 15px 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .search-bar {
          flex: 1;
          max-width: 500px;
          position: relative;
        }

        .search-bar input {
          width: 100%;
          padding: 10px 15px 10px 40px;
          border: 1px solid var(--light-gray);
          border-radius: 30px;
          outline: none;
          transition: var(--transition);
          font-size: 0.9rem;
        }

        .search-bar input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-color);
          font-size: 1rem;
        }

          .clickable {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .clickable:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1);
  }

  .clickable:active {
    transform: translateY(-1px);
  }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notification-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          color: var(--gray-color);
          cursor: pointer;
          position: relative;
          transition: var(--transition);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .notification-btn:hover {
          background: var(--light-gray);
          color: var(--dark-color);
        }

        .notification-btn .badge {
          position: absolute;
          top: 0;
          right: 0;
        }

        .user-menu {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          padding: 5px;
          border-radius: 30px;
          transition: var(--transition);
        }

        .user-menu:hover {
          background: var(--light-gray);
        }

        .user-menu .profile-img {
          width: 36px;
          height: 36px;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .dropdown-icon {
          transition: var(--transition);
        }

        .dropdown-icon.open {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          min-width: 200px;
          padding: 10px 0;
          z-index: 100;
          margin-top: 10px;
          opacity: 0;
          transform: translateY(-10px);
          animation: fadeIn 0.2s ease forwards;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item {
          padding: 10px 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          transition: var(--transition);
          cursor: pointer;
        }

        .dropdown-item:hover {
          background: var(--light-gray);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--light-gray);
          margin: 5px 0;
        }

        /* Page Content Styles */
        .page-content {
          padding: 25px;
          flex: 1;
        }

        .page-header {
          margin-bottom: 25px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .page-title {
          color: var(--dark-color);
          font-size: 1.8rem;
          font-weight: 600;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--gray-color);
        }

        .breadcrumb .active {
          color: var(--primary-color);
          font-weight: 500;
        }

        /* Dashboard Cards */
        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: var(--transition);
          display: flex;
          gap: 15px;
          border: 1px solid #f0f0f0;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .card-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: white;
        }

        .card-icon.user {
          background: linear-gradient(135deg, #4361ee, #3f37c9);
        }

        .card-icon.revenue {
          background: linear-gradient(135deg, #4cc9f0, #4895ef);
        }

        .card-icon.orders {
          background: linear-gradient(135deg, #f8961e, #f3722c);
        }

        .card-icon.products {
          background: linear-gradient(135deg, #43aa8b, #90be6d);
        }

        .card-content {
          flex: 1;
        }

        .card h3 {
          color: var(--gray-color);
          font-size: 0.95rem;
          margin-bottom: 10px;
          font-weight: 500;
        }

        .card .stat {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--dark-color);
          margin-bottom: 5px;
        }

        .trend {
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .trend-icon {
          font-size: 1rem;
        }

        .trend.up {
          color: var(--success-color);
        }

        .trend.down {
          color: var(--danger-color);
        }

        /* Chart Container */
        .chart-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          margin-bottom: 30px;
          border: 1px solid #f0f0f0;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .chart-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .chart-legend {
          display: flex;
          gap: 15px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.85rem;
        }

        .legend-item .color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .legend-item .color.users {
          background: var(--primary-color);
        }

        .legend-item .color.revenue {
          background: var(--success-color);
        }

        .chart-placeholder {
          height: 300px;
          background: #f9f9f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-color);
        }

        /* Data Table Styles */
        .data-table-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .table-header h3 {
          color: var(--dark-color);
          font-size: 1.1rem;
          font-weight: 600;
        }

        .primary-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition);
          font-weight: 500;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .primary-btn:hover {
          background: var(--secondary-color);
          box-shadow: 0 2px 8px rgba(67, 97, 238, 0.3);
        }

        .btn-icon {
          font-size: 0.9rem;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .data-table th {
          background: var(--light-color);
          padding: 12px 15px;
          text-align: left;
          color: var(--gray-color);
          font-weight: 500;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .data-table td {
          padding: 12px 15px;
          border-bottom: 1px solid var(--light-gray);
          color: var(--dark-color);
          font-size: 0.9rem;
          vertical-align: middle;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover td {
          background: #f9f9f9;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-cell img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .status {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          display: inline-block;
        }

        .status.active {
          background: #e3fafc;
          color: #15aabf;
        }

        .status.inactive {
          background: #fff3bf;
          color: #f08c00;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          font-size: 0.9rem;
        }

        .action-btn.edit {
          background: var(--primary-light);
          color: var(--primary-color);
        }

        .action-btn.edit:hover {
          background: var(--primary-color);
          color: white;
        }

        .action-btn.delete {
          background: #fff0f6;
          color: var(--danger-color);
        }

        .action-btn.delete:hover {
          background: var(--danger-color);
          color: white;
        }

        .table-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          font-size: 0.85rem;
          color: var(--gray-color);
        }

        .pagination {
          display: flex;
          gap: 5px;
        }

        .page-btn {
          padding: 6px 12px;
          border: 1px solid var(--light-gray);
          background: white;
          border-radius: 4px;
          cursor: pointer;
          transition: var(--transition);
          font-size: 0.85rem;
        }

        .page-btn:hover {
          background: var(--light-gray);
        }

        .page-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .page-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Responsive Styles */
        @media (max-width: 992px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 1000;
          }
          
          .sidebar.closed {
            transform: translateX(-100%);
          }
          
          .main-content {
            margin-left: 0;
          }

          .user-name {
            display: none;
          }
        }

        /* Delivery & Logistics Styles */
.delivery-container {
  padding: 20px 0;
}

.delivery-title {
  color: var(--dark-color);
  font-size: 1.5rem;
  margin-bottom: 25px;
  font-weight: 600;
}

.delivery-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.delivery-cards .card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.delivery-cards .card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-icon.assign {
  background: linear-gradient(135deg, #4cc9f0, #4895ef);
}

.card-icon.track {
  background: linear-gradient(135deg, #43aa8b, #90be6d);
}

.card-icon.partners {
  background: linear-gradient(135deg, #f8961e, #f3722c);
}

.card-content .description {
  color: var(--gray-color);
  font-size: 0.9rem;
  margin-top: 5px;
}

        @media (max-width: 768px) {
          .dashboard-cards {
            grid-template-columns: 1fr 1fr;
          }
          
          .top-nav {
            padding: 15px;
          }
          
          .page-content {
            padding: 15px;
          }
        }

        @media (max-width: 576px) {
          .dashboard-cards {
            grid-template-columns: 1fr;
          }
          
          .data-table th, 
          .data-table td {
            padding: 8px 10px;
          }

          .table-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .chart-legend {
            flex-wrap: wrap;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;