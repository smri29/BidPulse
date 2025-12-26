import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/layout/Navbar'; // <--- Import this

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BidderDashboard from './pages/dashboard/BidderDashboard';
import SellerDashboard from './pages/dashboard/SellerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CreateAuction from './pages/dashboard/CreateAuction';
import AuctionDetails from './pages/AuctionDetails';
import EditAuction from './pages/dashboard/EditAuction';
import PaymentSuccess from './pages/PaymentSuccess';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Navbar sits here, visible on all pages */}
      <Navbar /> 
      
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/bidder" element={<BidderDashboard />} />
          <Route path="/dashboard/seller" element={<SellerDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/create-auction" element={<CreateAuction />} />
          <Route path="/auction/:id" element={<AuctionDetails />} />
          <Route path="/edit-auction/:id" element={<EditAuction />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="*" element={<div className="p-10 text-center">404 Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;