import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HelpCircle, Mail, MessageCircle, Send, Bot, User, Ticket } from 'lucide-react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios, { socketUrl } from '../utils/axiosConfig';
import Reveal from '../components/ui/Reveal';

const HelpCenter = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeSupport, setActiveSupport] = useState('email');
  const [sending, setSending] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const socketRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'system',
      name: 'AuctionPulse Bot',
      message: 'Welcome to live support. An admin can join this chat shortly.',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [ticketForm, setTicketForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(socketUrl, { transports: ['websocket', 'polling'] });
    }

    const socket = socketRef.current;
    socket.emit('support:join', {
      name: user?.name || 'Guest User',
      role: user?.role || 'user',
    });

    socket.on('support:message', (payload) => {
      setChatMessages((prev) => [...prev, payload]);
    });

    socket.on('support:system', (payload) => {
      setChatMessages((prev) => [...prev, { ...payload, role: 'system' }]);
    });

    return () => {
      socket.off('support:message');
      socket.off('support:system');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.name, user?.role]);

  const faqs = useMemo(
    () => [
      {
        q: 'How do I get my money back?',
        a: "If you do not receive your item, do not click 'Confirm Receipt'. Open a support ticket and we will investigate delivery proof.",
      },
      {
        q: 'Is there a fee for selling?',
        a: 'AuctionPulse charges 5% commission on completed sales. If no one registers, the withdrawal fee is $9.99 or the relisting fee is $14.99.',
      },
      {
        q: 'Can I cancel an auction offer?',
        a: 'Auction offers are binding. For input errors, contact support immediately with the auction ID and offer amount.',
      },
    ],
    []
  );

  const onTicketChange = (e) => {
    setTicketForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitTicket = async (e) => {
    e.preventDefault();
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

  const sendLiveMessage = (e) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    socketRef.current?.emit('support:message', {
      name: user?.name || 'Guest User',
      role: user?.role || 'user',
      message: trimmed,
    });

    setChatInput('');
  };

  return (
    <div className="py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h1 className="text-4xl font-extrabold text-bid-dark md:text-5xl">Help Center</h1>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">Fast support response, transparent resolution flow, and real-time guidance.</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Reveal className="lg:col-span-1">
            <div className="premium-panel rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                <HelpCircle size={18} className="text-bid-purple" /> FAQ
              </h2>
              <div className="space-y-4">
                {faqs.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          </Reveal>

          <div className="space-y-6 lg:col-span-2">
            <Reveal delay={60}>
              <div className="premium-panel rounded-2xl p-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveSupport('email')}
                    className={`px-4 py-3 text-sm ${activeSupport === 'email' ? 'btn-secondary text-white' : 'btn-soft text-slate-700'}`}
                    type="button"
                  >
                    <span className="inline-flex items-center justify-center gap-2"><Mail size={16} /> Email Support</span>
                  </button>
                  <button
                    onClick={() => setActiveSupport('chat')}
                    className={`px-4 py-3 text-sm ${activeSupport === 'chat' ? 'btn-secondary text-white' : 'btn-soft text-slate-700'}`}
                    type="button"
                  >
                    <span className="inline-flex items-center justify-center gap-2"><MessageCircle size={16} /> Live Chat</span>
                  </button>
                </div>
              </div>
            </Reveal>

            {activeSupport === 'email' ? (
              <Reveal delay={100}>
                <form onSubmit={submitTicket} className="premium-panel rounded-2xl space-y-4 p-6">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Ticket size={18} className="text-bid-purple" /> Open a support ticket
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input name="name" value={ticketForm.name} onChange={onTicketChange} required placeholder="Your Name" className="rounded-xl border border-slate-200 bg-white px-3 py-2" />
                    <input name="email" value={ticketForm.email} onChange={onTicketChange} required type="email" placeholder="Your Email" className="rounded-xl border border-slate-200 bg-white px-3 py-2" />
                  </div>
                  <input name="subject" value={ticketForm.subject} onChange={onTicketChange} required placeholder="Subject" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" />
                  <textarea name="message" value={ticketForm.message} onChange={onTicketChange} required rows={5} placeholder="Describe your issue in detail" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" />
                  <button disabled={sending} className="btn-premium px-5 py-2.5 text-sm disabled:opacity-70" type="submit">
                    <Send size={16} /> {sending ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </form>
              </Reveal>
            ) : (
              <Reveal delay={100}>
                <div className="premium-panel rounded-2xl p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">Live Chat Support</h3>
                      <p className="text-sm text-slate-500">Real-time chat with support and admin moderators</p>
                    </div>
                    <span className="animate-pulse-glow rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">LIVE</span>
                  </div>

                  <div className="mb-4 h-80 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'admin' ? 'justify-start' : msg.role === 'system' ? 'justify-center' : 'justify-end'}`}>
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                            msg.role === 'admin'
                              ? 'bg-slate-900 text-white'
                              : msg.role === 'system'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-bid-purple text-white'
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2 text-xs opacity-90">
                            {msg.role === 'admin' || msg.role === 'system' ? <Bot size={12} /> : <User size={12} />} {msg.name || 'System'}
                          </div>
                          <div>{msg.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={sendLiveMessage} className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2"
                    />
                    <button className="btn-secondary px-4 text-sm" type="submit">
                      <Send size={14} /> Send
                    </button>
                  </form>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQItem = ({ q, a }) => (
  <div className="rounded-xl border border-slate-100 bg-white/90 p-4">
    <h3 className="mb-1 text-sm font-semibold text-slate-900">{q}</h3>
    <p className="text-sm text-slate-600">{a}</p>
  </div>
);

export default HelpCenter;
