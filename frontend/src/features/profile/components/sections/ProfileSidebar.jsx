import React from 'react';
import { motion } from 'motion/react';
import { BadgeAlert, CheckCircle } from 'lucide-react';

import Reveal from '../../../../components/ui/Reveal';
import ProfileMetricCard from '../ProfileMetricCard';

const ProfileSidebar = ({ user, stats }) => (
  <Reveal delay={120}>
    <section className="space-y-4">
      <motion.div whileHover={{ y: -2 }} className="premium-panel rounded-2xl p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Verification Status</h3>
        <div className="flex items-center gap-2 text-sm">
          {user.emailVerified ? (
            <>
              <CheckCircle size={16} className="text-green-600" />
              <span className="font-medium text-green-700">Profile verified and auction-ready</span>
            </>
          ) : (
            <>
              <BadgeAlert size={16} className="text-amber-600" />
              <span className="font-medium text-amber-700">Profile verification required</span>
            </>
          )}
        </div>
      </motion.div>

      <motion.div whileHover={{ y: -2 }} className="premium-panel rounded-2xl p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Activity Snapshot</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <ProfileMetricCard label="Listed" value={stats.totalListed} />
          <ProfileMetricCard label="Offers Placed" value={stats.totalPlacedBids} />
          <ProfileMetricCard label="Wins" value={stats.totalWins} />
          <ProfileMetricCard label="Losses" value={stats.totalLosses} />
        </div>
      </motion.div>
    </section>
  </Reveal>
);

export default ProfileSidebar;
