import React, { useEffect, useMemo, useState } from 'react';
import { HelpCircle, Mail, MessageCircle, Send, Bot, User, Ticket } from 'lucide-react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios, { socketUrl } from '../utils/axiosConfig';

const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

const HelpCenter = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeSupport, setActiveSupport] = useState('email');
  const [sending, setSending] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'system',
      name: 'BidPulse Bot',
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
        a: 'BidPulse charges a flat 8% commission on completed sales. There are no listing fees.',
      },
      {
        q: 'Can I cancel a bid?',
        a: 'Bids are binding. For input errors, contact support immediately with auction ID and bid amount.',
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

    socket.emit('support:message', {
      name: user?.name || 'Guest User',
      role: user?.role || 'user',
      message: trimmed,
    });

    setChatInput('');
  };

  return (
    <div className="min-h-screen py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Help Center</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Fast human support, transparent resolution flow, and real-time guidance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 glass-surface rounded-2xl border border-white/60 p-6 animate-fade-up">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle size={18} className="text-bid-purple" /> FAQ
            </h2>
            <div className="space-y-4">
              {faqs.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="glass-surface rounded-2xl border border-white/60 p-4 animate-fade-up">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveSupport('email')}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    activeSupport === 'email' ? 'bg-bid-purple text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  <span className="inline-flex items-center gap-2 justify-center"><Mail size={16} /> Email Support</span>
                </button>
                <button
                  onClick={() => setActiveSupport('chat')}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    activeSupport === 'chat' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  <span className="inline-flex items-center gap-2 justify-center"><MessageCircle size={16} /> Live Chat</span>
                </button>
              </div>
            </div>

            {activeSupport === 'email' ? (
              <form onSubmit={submitTicket} className="glass-surface rounded-2xl border border-white/60 p-6 space-y-4 animate-fade-up">
                <div className="flex items-center gap-2 text-gray-800 font-bold">
                  <Ticket size={18} className="text-bid-purple" /> Open a support ticket
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" value={ticketForm.name} onChange={onTicketChange} required placeholder="Your Name" className="rounded-xl border border-gray-300 px-3 py-2" />
                  <input name="email" value={ticketForm.email} onChange={onTicketChange} required type="email" placeholder="Your Email" className="rounded-xl border border-gray-300 px-3 py-2" />
                </div>
                <input name="subject" value={ticketForm.subject} onChange={onTicketChange} required placeholder="Subject" className="rounded-xl border border-gray-300 px-3 py-2 w-full" />
                <textarea name="message" value={ticketForm.message} onChange={onTicketChange} required rows={5} placeholder="Describe your issue in detail" className="rounded-xl border border-gray-300 px-3 py-2 w-full" />
                <button disabled={sending} className="bg-bid-purple hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 disabled:opacity-70">
                  <Send size={16} /> {sending ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            ) : (
              <div className="glass-surface rounded-2xl border border-white/60 p-6 animate-fade-up">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Live Chat Support</h3>
                    <p className="text-sm text-gray-500">Real-time chat with support and admin moderators</p>
                  </div>
                  <span className="animate-pulse-glow bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold">LIVE</span>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 h-80 overflow-y-auto space-y-3 mb-4">
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
                        <div className="flex items-center gap-2 mb-1 opacity-90 text-xs">
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
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2"
                  />
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 font-semibold inline-flex items-center gap-1">
                    <Send size={14} /> Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQItem = ({ q, a }) => (
  <div className="bg-white/80 rounded-xl p-4 border border-gray-100">
    <h3 className="font-semibold text-gray-900 mb-1 text-sm">{q}</h3>
    <p className="text-gray-600 text-sm">{a}</p>
  </div>
);

export default HelpCenter;
