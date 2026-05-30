import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';

import Reveal from '../../../components/ui/Reveal';
import { helpCenterFaqs } from '../helpCenterFaqs';

const HelpCenterFaqPanel = () => (
  <Reveal>
    <div className="surface-card rounded-[2rem] p-6">
      <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
        <HelpCircle size={18} className="text-bid-purple" /> Common Questions
      </h2>
      <div className="space-y-4">
        {helpCenterFaqs.map((item, index) => (
          <motion.div
            key={item.q}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-100 bg-white/90 p-4"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <h3 className="mb-1 text-sm font-semibold text-slate-900">{item.q}</h3>
            <p className="text-sm leading-6 text-slate-600">{item.a}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </Reveal>
);

export default HelpCenterFaqPanel;
