import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Security Check: Must be logged in AND have role 'admin'
  if (!user || user.role !== 'admin') {
    // Redirect unauthorized users to the Admin Login page
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminRoute;