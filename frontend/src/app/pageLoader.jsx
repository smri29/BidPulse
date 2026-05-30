/**
 * Module: app/pageLoader.jsx
 * Purpose: Supports the page Loader module and keeps its responsibility isolated by file name.
 */
import React from 'react';

// Shared suspense fallback for route-level lazy pages.
export const pageLoader = (
  <div className="flex h-[60vh] items-center justify-center text-sm text-gray-500">Loading page...</div>
);

