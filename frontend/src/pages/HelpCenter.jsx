import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bot,
  HelpCircle,
  Mail,
  MessageCircle,
  Send,
  Ticket,
  User,
} from 'lucide-react';
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
        q: 'What happens if delivery fails?',
        a: "Do not confirm receipt. Open a support ticket and our team will investigate using shipment, payment, and auction records.",
      },
      {
        q: 'How are seller charges handled?',
        a: 'Completed sales carry a 5% platform commission. Additional withdrawal or relisting fees may apply when an auction receives no registrants.',
      },
      {
        q: 'Can an auction offer be reversed?',
        a: 'Offers are treated as binding participation. If you made an input error, contact support quickly with the auction ID and the exact issue.',
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
    <div className="relative overflow-hidden py-14">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">
            Help Center
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-bid-dark md:text-5xl">
            Support built for a managed auction marketplace
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Ask a question, open a formal support ticket, or move into real-time chat when you need
            faster guidance. AuctionPulse keeps help simple, traceable, and responsive.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Reveal>
            <div className="surface-card rounded-[2rem] p-6">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                <HelpCircle size={18} className="text-bid-purple" /> Common Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((item, index) => (
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

          <div className="space-y-6">
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

            {activeSupport === 'email' ? (
              <Reveal delay={100}>
                <form
                  onSubmit={submitTicket}
                  className="premium-panel rounded-[2rem] space-y-4 p-6 sm:p-7"
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <Ticket size={18} className="text-bid-purple" /> Open a support ticket
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Best for account issues, auction disputes, delivery concerns, or questions that
                      need documented follow-up.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      name="name"
                      value={ticketForm.name}
                      onChange={onTicketChange}
                      required
                      placeholder="Your Name"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    />
                    <input
                      name="email"
                      value={ticketForm.email}
                      onChange={onTicketChange}
                      required
                      type="email"
                      placeholder="Your Email"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    />
                  </div>

                  <input
                    name="subject"
                    value={ticketForm.subject}
                    onChange={onTicketChange}
                    required
                    placeholder="Subject"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  />
                  <textarea
                    name="message"
                    value={ticketForm.message}
                    onChange={onTicketChange}
                    required
                    rows={5}
                    placeholder="Describe your issue in detail"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  />
                  <button
                    disabled={sending}
                    className="btn-premium px-5 py-2.5 text-sm disabled:opacity-70"
                    type="submit"
                  >
                    <Send size={16} /> {sending ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </form>
              </Reveal>
            ) : (
              <Reveal delay={100}>
                <div className="premium-panel rounded-[2rem] p-6 sm:p-7">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900">Live Chat Support</h3>
                      <p className="text-sm text-slate-500">
                        Real-time support for faster guidance while you browse or participate.
                      </p>
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
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.role === 'admin'
                            ? 'justify-start'
                            : msg.role === 'system'
                              ? 'justify-center'
                              : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                            msg.role === 'admin'
                              ? 'bg-slate-900 text-white'
                              : msg.role === 'system'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-bid-purple text-white'
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2 text-xs opacity-90">
                            {msg.role === 'admin' || msg.role === 'system' ? (
                              <Bot size={12} />
                            ) : (
                              <User size={12} />
                            )}{' '}
                            {msg.name || 'System'}
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
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3"
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

export default HelpCenter;
