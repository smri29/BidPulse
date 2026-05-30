/**
 * Module: features/helpCenter/HelpCenterPage.jsx
 * Purpose: Renders the Help Center Page screen by composing smaller feature-specific sections.
 */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import axios from '../../utils/axiosConfig';
import Reveal from '../../components/ui/Reveal';
import { createSupportWelcomeMessage, useSupportRoom } from '../support/useSupportRoom';
import HelpCenterFaqPanel from './components/HelpCenterFaqPanel';
import HelpCenterSupportToggle from './components/HelpCenterSupportToggle';
import SupportLiveChatPanel from './components/SupportLiveChatPanel';
import SupportTicketForm from './components/SupportTicketForm';

const HelpCenterPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeSupport, setActiveSupport] = useState('email');
  const [sending, setSending] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const { chatInput, setChatInput, chatMessages, sendLiveMessage } = useSupportRoom({
    user,
    initialMessages: [createSupportWelcomeMessage()],
  });

  useEffect(() => {
    setTicketForm((prev) => ({
      ...prev,
      name: user?.name || prev.name || '',
      email: user?.email || prev.email || '',
    }));
  }, [user?.email, user?.name]);

  const onTicketChange = (event) => {
    setTicketForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const submitTicket = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      const { data } = await axios.post('/support/tickets', ticketForm);
      toast.success(`Support ticket submitted: ${data.ticketId}`);
      setTicketForm((prev) => ({ ...prev, subject: '', message: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit support request');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative overflow-hidden py-14">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">Help Center</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-bid-dark md:text-5xl">Support built for a managed auction marketplace</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600">Ask a question, open a formal support ticket, or move into real-time chat when you need faster guidance. AuctionPulse keeps help simple, traceable, and responsive.</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <HelpCenterFaqPanel />

          <div className="space-y-6">
            <HelpCenterSupportToggle
              activeSupport={activeSupport}
              setActiveSupport={setActiveSupport}
            />

            {activeSupport === 'email' ? (
              <SupportTicketForm
                ticketForm={ticketForm}
                sending={sending}
                onTicketChange={onTicketChange}
                submitTicket={submitTicket}
              />
            ) : (
              <SupportLiveChatPanel
                chatMessages={chatMessages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                sendLiveMessage={sendLiveMessage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
