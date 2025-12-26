import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components (Layout & Security)
import Navbar from './components/layout/Navbar'; 
import Footer from './components/Footer'; 
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages (Public)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AuctionDetails from './pages/AuctionDetails';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Safety from './pages/Safety';
import HelpCenter from './pages/HelpCenter';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Pages (Dashboard & Protected)
import BidderDashboard from './pages/dashboard/BidderDashboard';
import SellerDashboard from './pages/dashboard/SellerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CreateAuction from './pages/dashboard/CreateAuction'; 
import EditAuction from './pages/dashboard/EditAuction';
import PaymentSuccess from './pages/PaymentSuccess';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} />
        
        <Navbar />
        
        <main className="flex-grow bg-slate-50">
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/auction/:id" element={<AuctionDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* --- Protected Bidder Routes --- */}
            <Route 
              path="/dashboard/bidder" 
              element={
                <PrivateRoute>
                  <BidderDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/payment/success" 
              element={
                <PrivateRoute>
                  <PaymentSuccess />
                </PrivateRoute>
              } 
            />

            {/* --- Protected Seller Routes --- */}
            <Route 
              path="/dashboard/seller" 
              element={
                <PrivateRoute>
                  <SellerDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/create-auction" 
              element={
                <PrivateRoute>
                  <CreateAuction />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/edit-auction/:id" 
              element={
                <PrivateRoute>
                  <EditAuction />
                </PrivateRoute>
              } 
            />

            {/* --- Protected Admin Routes --- */}
            <Route 
              path="/dashboard/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />

            {/* --- 404 Fallback --- */}
            <Route path="*" element={<div className="p-10 text-center text-gray-500">404 - Page Not Found</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;