import React from 'react';
import AnimatedNumber from '../../../components/ui/AnimatedNumber';

const ProfileMetricCard = ({ label, value }) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <AnimatedNumber value={value} className="text-lg font-semibold text-gray-900" />
  </div>
);

export default ProfileMetricCard;
