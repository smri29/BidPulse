/**
 * Module: features/profile/components/ProfileInfoCard.jsx
 * Purpose: Presents the Profile Info Card UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { motion } from 'motion/react';

const ProfileInfoCard = ({ label, value, icon }) => (
  <motion.div whileHover={{ y: -2 }} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
      {icon}
      {value}
    </p>
  </motion.div>
);

export default ProfileInfoCard;
