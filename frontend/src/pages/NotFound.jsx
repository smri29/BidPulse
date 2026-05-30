/**
 * Module: pages/NotFound.jsx
 * Purpose: Supports the Not Found module and keeps its responsibility isolated by file name.
 */
import React from 'react';
import { Link } from 'react-router-dom';

// Fallback page for unmatched routes.
const NotFound = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
    <h1 className="text-4xl font-bold text-gray-900">404</h1>
    <p className="mt-2 text-gray-600">The page you are looking for does not exist.</p>
    <Link
      to="/"
      className="mt-6 inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
    >
      Back to Home
    </Link>
  </div>
);

export default NotFound;
