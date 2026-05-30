/**
 * Module: features/helpCenter/components/SupportTicketForm.jsx
 * Purpose: Presents the Support Ticket Form UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { Send, Ticket } from 'lucide-react';

import Reveal from '../../../components/ui/Reveal';

const SupportTicketForm = ({
  ticketForm,
  sending,
  onTicketChange,
  submitTicket,
}) => (
  <Reveal delay={100}>
    <form onSubmit={submitTicket} className="premium-panel rounded-[2rem] space-y-4 p-6 sm:p-7">
      <div>
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Ticket size={18} className="text-bid-purple" /> Open a support ticket
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Best for account issues, auction disputes, delivery concerns, or questions that need documented follow-up.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input name="name" value={ticketForm.name} onChange={onTicketChange} required placeholder="Your Name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
        <input name="email" value={ticketForm.email} onChange={onTicketChange} required type="email" placeholder="Your Email" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      </div>
      <input name="subject" value={ticketForm.subject} onChange={onTicketChange} required placeholder="Subject" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      <textarea name="message" value={ticketForm.message} onChange={onTicketChange} required rows={5} placeholder="Describe your issue in detail" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      <button disabled={sending} className="btn-premium px-5 py-2.5 text-sm disabled:opacity-70" type="submit">
        <Send size={16} /> {sending ? 'Submitting...' : 'Submit Ticket'}
      </button>
    </form>
  </Reveal>
);

export default SupportTicketForm;
