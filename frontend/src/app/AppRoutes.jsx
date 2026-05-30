import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import PrivateRoute from '../components/PrivateRoute';
import AdminRoute from '../components/AdminRoute';
import { pageLoader } from './pageLoader';
import * as Pages from './lazyPages';

// Route tree is separated from App so page composition is easy to scan in one place.
const AppRoutes = () => (
  <Suspense fallback={pageLoader}>
    <Routes>
      <Route path="/" element={<Pages.Home />} />
      <Route path="/login" element={<Pages.Login />} />
      <Route path="/register" element={<Pages.Register />} />
      <Route path="/auction/:id" element={<Pages.AuctionDetails />} />
      <Route path="/about" element={<Pages.About />} />
      <Route path="/how-it-works" element={<Pages.HowItWorks />} />
      <Route path="/safety" element={<Pages.Safety />} />
      <Route path="/help" element={<Pages.HelpCenter />} />
      <Route path="/terms" element={<Pages.Terms />} />
      <Route path="/privacy" element={<Pages.Privacy />} />
      <Route path="/verify-profile/:token" element={<Pages.ProfileVerificationLink />} />
      <Route path="/forgot-password" element={<Pages.ForgotPassword />} />
      <Route path="/reset-password/:resetToken" element={<Pages.ResetPassword />} />

      <Route path="/profile" element={<PrivateRoute><Pages.Profile /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Pages.Settings /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Pages.Notifications /></PrivateRoute>} />
      <Route path="/dashboard/bidder" element={<PrivateRoute><Pages.BidderDashboard /></PrivateRoute>} />
      <Route path="/payment/success" element={<PrivateRoute><Pages.PaymentSuccess /></PrivateRoute>} />
      <Route path="/dashboard/seller" element={<PrivateRoute><Pages.SellerDashboard /></PrivateRoute>} />
      <Route path="/create-auction" element={<PrivateRoute><Pages.CreateAuction /></PrivateRoute>} />
      <Route path="/edit-auction/:id" element={<PrivateRoute><Pages.EditAuction /></PrivateRoute>} />

      <Route path="/dashboard/admin" element={<AdminRoute><Pages.AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><Pages.AdminUsers /></AdminRoute>} />
      <Route path="/admin/auctions" element={<AdminRoute><Pages.AdminAuctions /></AdminRoute>} />
      <Route path="/admin/support" element={<AdminRoute><Pages.AdminSupport /></AdminRoute>} />
      <Route path="/admin/profile" element={<AdminRoute><Pages.AdminProfile /></AdminRoute>} />

      <Route path="*" element={<Pages.NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
