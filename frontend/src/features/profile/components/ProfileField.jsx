/**
 * Module: features/profile/components/ProfileField.jsx
 * Purpose: Presents the Profile Field UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';

const ProfileField = ({ label, required = false, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
      {required ? ' *' : ''}
    </span>
    {children}
  </label>
);

export default ProfileField;
