import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';

// Components (Layout & Security)
import Navbar from './components/layout/Navbar'; 
import AdminNavbar from './components/layout/AdminNavbar'; // Import AdminNavbar
import Footer from './components/Footer'; 
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import FloatingSupportChat from './components/ui/FloatingSupportChat';

// Lazy pages for faster initial bundle load
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AuctionDetails = lazy(() => import('./pages/AuctionDetails'));
const About = lazy(() => import('./pages/About'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Safety = lazy(() => import('./pages/Safety'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileVerificationLink = lazy(() => import('./pages/ProfileVerificationLink'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const BidderDashboard = lazy(() => import('./pages/dashboard/BidderDashboard'));
const SellerDashboard = lazy(() => import('./pages/dashboard/SellerDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/dashboard/AdminUsers'));
const AdminAuctions = lazy(() => import('./pages/dashboard/AdminAuctions'));
const AdminSupport = lazy(() => import('./pages/dashboard/AdminSupport'));
const AdminProfile = lazy(() => import('./pages/dashboard/AdminProfile'));
const CreateAuction = lazy(() => import('./pages/dashboard/CreateAuction'));
const EditAuction = lazy(() => import('./pages/dashboard/EditAuction'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const NotFound = lazy(() => import('./pages/NotFound'));
import { fetchCurrentUser, forceLogout } from './redux/authSlice';
import { addNotification, setNotificationOwner } from './redux/notificationSlice';
import { socketUrl } from './utils/axiosConfig';

const GLOBAL_NOTIFY_EVENTS = ['AuctionPulse:notify', 'BidPulse:notify', 'rizbid:notify'];
const AUTH_EXPIRED_EVENTS = ['AuctionPulse:auth-expired', 'BidPulse:auth-expired', 'RiZBiD:auth-expired'];

// Main application shell:
// 1. defines all routes
// 2. chooses the correct navbar for admin vs regular users
// 3. keeps session/user state fresh
// 4. subscribes to realtime notifications
// 5. converts global app events into visible toasts/notifications
function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const lastSessionCheckRef = useRef(0);
  const SESSION_RECHECK_INTERVAL_MS = 3 * 60 * 1000;
  const isAdminSession = user?.role === 'admin';

  useEffect(() => {
    // Notification history is stored per-user, so swap notification ownership when the session changes.
    dispatch(setNotificationOwner(user || null));
  }, [dispatch, user?._id, user?.id, user?.email, user?.role]);

  useEffect(() => {
    // Rehydrate the latest user/profile state from the backend whenever a token is present.
    if (!user?.token) return;
    lastSessionCheckRef.current = Date.now();
    dispatch(fetchCurrentUser());
  }, [dispatch, user?.token]);

  useEffect(() => {
    if (!user?.token) return undefined;

    // Logged-in users open a personal socket connection for server-pushed notifications.
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: { token: user.token },
    });
    socket.on('notification', (payload) => {
      dispatch(addNotification({
        id: payload?.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: payload?.title || 'Live Update',
        message: payload?.message || 'New platform activity detected',
        type: payload?.type || 'info',
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, user?.token]);

  useEffect(() => {
    // Axios and other shared utilities emit global notification events onto window.
    const handleGlobalNotify = (event) => {
      const detail = event.detail || {};
      if (!detail.message) return;

      dispatch(addNotification(detail));
    };

    GLOBAL_NOTIFY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleGlobalNotify);
    });

    return () =>
      GLOBAL_NOTIFY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleGlobalNotify);
      });
  }, [dispatch]);

  useEffect(() => {
    // Global auth-expired events centralize forced logout behavior.
    const handleAuthExpired = () => {
      dispatch(forceLogout('Your session ended. Please log in again.'));
      dispatch(addNotification({
        id: 'auth-expired',
        title: 'Session Ended',
        message: 'Your session ended. Please log in again.',
        type: 'warning',
      }));
      toast.error('Your session ended. Please log in again.', { toastId: 'auth-expired-toast' });
    };

    AUTH_EXPIRED_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleAuthExpired);
    });

    return () =>
      AUTH_EXPIRED_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleAuthExpired);
      });
  }, [dispatch]);

  useEffect(() => {
    // Browser online/offline events are surfaced to the user as feedback notifications.
    const handleOnline = () => {
      toast.success('Back online', { toastId: 'network-online' });
      dispatch(addNotification({
        id: 'network-online',
        title: 'Network Restored',
        message: 'Back online',
        type: 'success',
      }));
    };
    const handleOffline = () => {
      toast.error('You are offline. Some actions may fail.', { toastId: 'network-offline' });
      dispatch(addNotification({
        id: 'network-offline',
        title: 'Network Offline',
        message: 'You are offline. Some actions may fail.',
        type: 'warning',
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  useEffect(() => {
    // If the tab becomes visible after a while, refresh session state defensively.
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
      <div className={`app-shell flex min-h-screen flex-col ${isAdminSession ? 'admin-theme' : ''}`}>
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Conditional Navbar: Show AdminNavbar if admin, else standard Navbar */}
        {user && user.role === 'admin' ? <AdminNavbar /> : <Navbar />}
        
        <main className={`app-main flex-grow ${isAdminSession ? 'admin-main' : 'bg-white/30 backdrop-blur-[2px]'}`}>
          <Suspense fallback={pageLoader}>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auction/:id" element={<AuctionDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/verify-profile/:token" element={<ProfileVerificationLink />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            {/* --- User Account Routes --- */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

            {/* --- Protected Buyer Routes --- */}
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
          </Suspense>
        </main>

        <FloatingSupportChat />
        <Footer />
      </div>
    </Router>
  );
}

export default App;

  const pageLoader = (
    <div className="h-[60vh] flex items-center justify-center text-gray-500 text-sm">Loading page...</div>
  );

