import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';

// Components (Layout & Security)
import Navbar from './components/layout/Navbar'; 
import AdminNavbar from './components/layout/AdminNavbar'; // Import AdminNavbar
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
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Pages (Dashboard & Protected)
import BidderDashboard from './pages/dashboard/BidderDashboard';
import SellerDashboard from './pages/dashboard/SellerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminUsers from './pages/dashboard/AdminUsers';
import AdminAuctions from './pages/dashboard/AdminAuctions';
import AdminSupport from './pages/dashboard/AdminSupport';
import AdminProfile from './pages/dashboard/AdminProfile';
import CreateAuction from './pages/dashboard/CreateAuction'; 
import EditAuction from './pages/dashboard/EditAuction';
import PaymentSuccess from './pages/PaymentSuccess';
import NotFound from './pages/NotFound';
import { fetchCurrentUser, forceLogout } from './redux/authSlice';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const lastSessionCheckRef = useRef(0);
  const SESSION_RECHECK_INTERVAL_MS = 3 * 60 * 1000;

  useEffect(() => {
    if (!user?.token) return;
    lastSessionCheckRef.current = Date.now();
    dispatch(fetchCurrentUser());
  }, [dispatch, user?.token]);

  useEffect(() => {
    const handleAuthExpired = () => {
      dispatch(forceLogout('Your session ended. Please log in again.'));
      toast.error('Your session ended. Please log in again.');
    };

    window.addEventListener('bidpulse:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('bidpulse:auth-expired', handleAuthExpired);
  }, [dispatch]);

  useEffect(() => {
    const handleOnline = () => toast.success('Back online');
    const handleOffline = () => toast.error('You are offline. Some actions may fail.');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      const now = Date.now();
      const enoughTimePassed = now - lastSessionCheckRef.current > SESSION_RECHECK_INTERVAL_MS;

      if (document.visibilityState === 'visible' && user?.token && enoughTimePassed) {
        lastSessionCheckRef.current = now;
        dispatch(fetchCurrentUser());
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [dispatch, user?.token]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Conditional Navbar: Show AdminNavbar if admin, else standard Navbar */}
        {user && user.role === 'admin' ? <AdminNavbar /> : <Navbar />}
        
        <main className="flex-grow bg-white/50 backdrop-blur-[1px]">
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            {/* --- User Account Routes --- */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

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
            
            {/* NEW: Manage Users Route */}
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/auctions" 
              element={
                <AdminRoute>
                  <AdminAuctions />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/support" 
              element={
                <AdminRoute>
                  <AdminSupport />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/profile" 
              element={
                <AdminRoute>
                  <AdminProfile />
                </AdminRoute>
              } 
            />

            {/* --- 404 Fallback --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
