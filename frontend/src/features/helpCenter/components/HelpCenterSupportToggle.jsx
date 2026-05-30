/**
 * Module: features/helpCenter/components/HelpCenterSupportToggle.jsx
 * Purpose: Presents the Help Center Support Toggle UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';

import Reveal from '../../../components/ui/Reveal';

const HelpCenterSupportToggle = ({ activeSupport, setActiveSupport }) => (
  <Reveal delay={60}>
    <div className="premium-panel rounded-[2rem] p-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveSupport('email')}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            activeSupport === 'email' ? 'btn-secondary text-white' : 'btn-soft text-slate-700'
          }`}
          type="button"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Mail size={16} /> Ticket Support
          </span>
        </button>
        <button
          onClick={() => setActiveSupport('chat')}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            activeSupport === 'chat' ? 'btn-secondary text-white' : 'btn-soft text-slate-700'
          }`}
          type="button"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <MessageCircle size={16} /> Live Chat
          </span>
        </button>
      </div>
    </div>
  </Reveal>
);

export default HelpCenterSupportToggle;
