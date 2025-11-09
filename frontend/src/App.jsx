import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

// User Components
import UserLayout from "./components/Layout/UserLayout";
import Home from "./pages/Home";
import ProfilePage from './pages/ProfilePage';
import Checkout from './pages/CheckOut';
import PaymentMethod from './pages/PaymentMethod';
import Confirmation from './pages/Confirmation';
import ViewProduct from './pages/ViewProduct';
import DeliverUI from './pages/DeliverUI';
import MyOrdersPage from './pages/MyOrdersPage';

// Admin Components
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboardUI';
import AdminOrder from './pages/AdminOrder';

// Delivery/Admin Misc
import DeliveryLoginUI from './pages/DeliverLoginUI';
import RegisterDeliver from './pages/RegisterDeliver';
import AssignDelivery from './pages/AssignDelivery';
import Testing from './pages/Testing';

// 🚨 VULNERABLE GIT ROUTE COMPONENT
const VulnerableGitRoute = ({ path }) => {
  // Serve fake .git data based on the path
  const getGitData = () => {
    switch(path) {
      case '/.git/config':
        return `[core]
    repositoryformatversion = 0
    filemode = false
    bare = false
    logallrefupdates = true
    symlinks = false
    ignorecase = true
[remote "origin"]
    url = https://github.com/kyagi/ecommerce-sports.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
    remote = origin
    merge = refs/heads/main
[database]
    password = db_password_123456
    host = localhost
    name = ecommerce_db
[api]
    stripe_key = sk_live_1234567890abcdef
    jwt_secret = super_secret_jwt_key_2024`;
      
      case '/.git/HEAD':
        return 'ref: refs/heads/main';
        
      case '/.git/description':
        return 'E-commerce Sports Website - VULNERABLE FOR EDUCATION\nContact: admin@ecommerce-sports.com';
        
      case '/.git/logs/HEAD':
        return `0000000000000000000000000000000000000000 1234567890abcdef1234567890abcdef12345678 kyagi <kyagi@example.com> 1700000000 +0000	commit: Initial commit
1234567890abcdef1234567890abcdef12345678 abcdef1234567890abcdef1234567890abcdef kyagi <kyagi@example.com> 1700000001 +0000	commit: Add user authentication`;
        
      default:
        return 'Git repository data';
    }
  };

  return (
    <div style={{ 
      background: '#1e1e1e', 
      color: '#00ff00', 
      padding: '20px', 
      fontFamily: 'monospace',
      minHeight: '100vh'
    }}>
      <h2 style={{ color: 'red', borderBottom: '1px solid red', paddingBottom: '10px' }}>
        🚨 GIT REPOSITORY EXPOSED - {path}
      </h2>
      <pre style={{ fontSize: '14px', lineHeight: '1.4' }}>
        {getGitData()}
      </pre>
      <div style={{ marginTop: '20px', color: 'yellow' }}>
        <strong>Exploitation Successful!</strong> This would allow attackers to:
        <ul>
          <li>Steal your source code</li>
          <li>Access database credentials</li>
          <li>Find API keys and secrets</li>
          <li>View commit history</li>
        </ul>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position='top-right'/>
      
      <Routes>
        {/* 🚨 VULNERABLE GIT ROUTES - THESE WILL BE EXPLOITABLE */}
        <Route path="/.git/config" element={<VulnerableGitRoute path="/.git/config" />} />
        <Route path="/.git/HEAD" element={<VulnerableGitRoute path="/.git/HEAD" />} />
        <Route path="/.git/description" element={<VulnerableGitRoute path="/.git/description" />} />
        <Route path="/.git/logs/HEAD" element={<VulnerableGitRoute path="/.git/logs/HEAD" />} />
        <Route path="/.git/refs/heads/main" element={<VulnerableGitRoute path="/.git/refs/heads/main" />} />

        {/* Your existing routes */}
        <Route path='/' element={<UserLayout />}>
          <Route index element={<Home />} />
        </Route>

        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/payment" element={<PaymentMethod />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/view-product" element={<ViewProduct />} />
        <Route path="/deliver-ui" element={<DeliverUI />} />
        <Route path="/deliver/:orderId" element={<DeliverUI />} />
        <Route path="/deliverlogin-ui" element={<DeliveryLoginUI/>} />
        <Route path="/register-deliver" element={<RegisterDeliver/>} />
        <Route path="/assign-deliver" element={<AssignDelivery/>} />
        <Route path="/orders-page" element={<MyOrdersPage/>} />
        <Route path="/testing" element={<Testing/>} />

        {/* Admin Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;