/**
 * Module: features/helpCenter/components/SupportLiveChatPanel.jsx
 * Purpose: Presents the Support Live Chat Panel UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { motion } from 'motion/react';
import { Bot, Send, User } from 'lucide-react';

import Reveal from '../../../components/ui/Reveal';

const SupportLiveChatPanel = ({
  chatMessages,
  chatInput,
  setChatInput,
  sendLiveMessage,
}) => (
  <Reveal delay={100}>
    <div className="premium-panel rounded-[2rem] p-6 sm:p-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">Live Chat Support</h3>
          <p className="text-sm text-slate-500">Real-time support for faster guidance while you browse or participate.</p>
        </div>
        <motion.span
          animate={{ opacity: [0.75, 1, 0.75] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
        >
          LIVE
        </motion.span>
      </div>

      <div className="mb-4 h-80 space-y-3 overflow-y-auto rounded-[1.5rem] border border-slate-200 bg-white p-4">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'admin' ? 'justify-start' : msg.role === 'system' ? 'justify-center' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'admin' ? 'bg-slate-900 text-white' : msg.role === 'system' ? 'bg-amber-100 text-amber-800' : 'bg-bid-purple text-white'}`}>
              <div className="mb-1 flex items-center gap-2 text-xs opacity-90">
                {msg.role === 'admin' || msg.role === 'system' ? <Bot size={12} /> : <User size={12} />} {msg.name || 'System'}
              </div>
              <div>{msg.message}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendLiveMessage} className="flex gap-2">
        <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Type your message..." className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3" />
        <button className="btn-secondary px-4 text-sm" type="submit">
          <Send size={14} /> Send
        </button>
      </form>
    </div>
  </Reveal>
);

export default SupportLiveChatPanel;
