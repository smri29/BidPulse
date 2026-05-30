/**
 * Module: components/PrivateRoute.jsx
 * Purpose: Supports the Private Route module and keeps its responsibility isolated by file name.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (!user && isLoading) return <div className="p-10 text-center">Loading...</div>;

  // PrivateRoute blocks guests from account-only pages.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
