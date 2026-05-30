/**
 * Module: features/auctionForm/Field.jsx
 * Purpose: Supports the Field module and keeps its responsibility isolated by file name.
 */
import React from 'react';

const AuctionField = ({ label, required = false, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
    {children}
  </div>
);

export default AuctionField;
