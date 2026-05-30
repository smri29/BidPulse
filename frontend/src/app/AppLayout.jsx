import React from 'react';
import { ToastContainer } from 'react-toastify';

import Navbar from '../components/layout/Navbar';
import AdminNavbar from '../components/layout/AdminNavbar';
import Footer from '../components/Footer';
import FloatingSupportChat from '../components/ui/FloatingSupportChat';

// Shared application shell chooses layout chrome based on the active session role.
const AppLayout = ({ user, children }) => {
  const isAdminSession = user?.role === 'admin';

  return (
    <div className={`app-shell flex min-h-screen flex-col ${isAdminSession ? 'admin-theme' : ''}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      {isAdminSession ? <AdminNavbar /> : <Navbar />}
      <main className={`app-main flex-grow ${isAdminSession ? 'admin-main' : 'bg-white/30 backdrop-blur-[2px]'}`}>
        {children}
      </main>
      <FloatingSupportChat />
      <Footer />
    </div>
  );
};

export default AppLayout;

