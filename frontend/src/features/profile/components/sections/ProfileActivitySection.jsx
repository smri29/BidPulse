import React from 'react';
import { motion } from 'motion/react';

import Reveal from '../../../../components/ui/Reveal';

const ProfileActivitySection = ({ activity }) => (
  <Reveal delay={140} className="mt-6">
    <section className="premium-panel rounded-2xl p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Auction Activity</h2>
      <div className="max-h-80 space-y-3 overflow-y-auto">
        {activity?.history?.placedBids?.length ? (
          activity.history.placedBids.map((item) => (
            <motion.div key={item._id} whileHover={{ x: 2 }} className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div>
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="mt-1 text-xs text-gray-500">Status: {item.status}</p>
              </div>
              <p className="font-semibold text-gray-900">${item.currentPrice}</p>
            </motion.div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No activity yet.</p>
        )}
      </div>
    </section>
  </Reveal>
);

export default ProfileActivitySection;
