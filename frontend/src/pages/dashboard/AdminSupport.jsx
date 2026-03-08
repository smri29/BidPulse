import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { motion } from 'motion/react';
import { toast } from 'react-toastify';
import { MailCheck, MessageCircle, Send, Ticket } from 'lucide-react';
import axios, { socketUrl } from '../../utils/axiosConfig';
import Reveal from '../../components/ui/Reveal';
import AnimatedNumber from '../../components/ui/AnimatedNumber';

const AdminSupport = () => {
  const { user } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const socketRef = useRef(null);

  const authConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${user?.token}` } }),
    [user?.token]
  );

  const ticketMetrics = useMemo(() => {
    const open = tickets.filter((item) => item.status === 'open').length;
    const inProgress = tickets.filter((item) => item.status === 'in_progress').length;
    const resolved = tickets.filter((item) => item.status === 'resolved').length;

    return {
      total: tickets.length,
      open,
      inProgress,
      resolved,
      chatMessages: chatMessages.length,
    };
  }, [chatMessages.length, tickets]);

  const fetchTickets = async () => {
    try {
      const { data } = await axios.get(`/support/tickets?status=${ticketFilter}`, authConfig);
      setTickets(data);
    } catch (_error) {
      toast.error('Failed to fetch support tickets');
    }
  };

  useEffect(() => {
    if (!user?.token) return;
    fetchTickets();
  }, [user?.token, ticketFilter]);

  useEffect(() => {
    if (!user?.token) return undefined;

    if (!socketRef.current) {
      socketRef.current = io(socketUrl, { transports: ['websocket', 'polling'] });
    }

    const socket = socketRef.current;
    socket.emit('support:join', { name: user?.name || 'Support Admin', role: 'admin' });
    socket.on('support:message', (payload) => setChatMessages((prev) => [...prev, payload]));
    socket.on('support:system', (payload) => setChatMessages((prev) => [...prev, { ...payload, role: 'system' }]));

    return () => {
      socket.off('support:message');
      socket.off('support:system');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.name, user?.token]);

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await axios.put(`/support/tickets/${ticketId}`, { status }, authConfig);
      setTickets((prev) => prev.map((ticket) => (ticket._id === ticketId ? { ...ticket, status } : ticket)));
      toast.success('Ticket updated');
    } catch (_error) {
      toast.error('Failed to update ticket');
    }
  };

  const sendTestEmail = async () => {
    try {
      const { data } = await axios.post('/admin/test-email', {}, authConfig);
      toast.success(data.message || 'Test email queued');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to queue test email');
    }
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    socketRef.current?.emit('support:message', {
      name: user?.name || 'Support Admin',
      role: 'admin',
      message: chatInput.trim(),
    });

    setChatInput('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Reveal>
        <section className="premium-panel rounded-2xl p-6 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Support Desk</h1>
              <p className="mt-1 text-sm text-slate-600">Manage support tickets, handle live chat, and run communication checks.</p>
            </div>
            <button onClick={sendTestEmail} className="btn-secondary rounded-lg px-4 py-2 text-sm font-semibold inline-flex items-center gap-2" type="button">
              <MailCheck size={16} /> Send Test Email
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Tickets" value={ticketMetrics.total} tone="blue" />
            <MetricCard label="Open" value={ticketMetrics.open} tone="amber" />
            <MetricCard label="In Progress" value={ticketMetrics.inProgress} tone="indigo" />
            <MetricCard label="Resolved" value={ticketMetrics.resolved} tone="emerald" />
            <MetricCard label="Live Messages" value={ticketMetrics.chatMessages} tone="slate" />
          </div>
        </section>
      </Reveal>

      <Reveal delay={80}>
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="premium-panel rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Ticket size={18} className="text-bid-purple" /> Support Tickets
              </h2>
              <select value={ticketFilter} onChange={(e) => setTicketFilter(e.target.value)} className="text-sm border border-slate-300 rounded px-2 py-1 bg-white">
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100 bg-white">
              {tickets.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">No tickets found.</p>
              ) : (
                tickets.map((ticket) => (
                  <motion.div key={ticket._id} whileHover={{ y: -1 }} className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{ticket.subject}</p>
                        <p className="text-xs text-slate-500">{ticket.name} ({ticket.email})</p>
                        <p className="text-sm text-slate-700 mt-2">{ticket.message}</p>
                      </div>
                      <select
                        value={ticket.status}
                        onChange={(e) => updateTicketStatus(ticket._id, e.target.value)}
                        className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="premium-panel rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/70">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle size={18} className="text-emerald-600" /> Live Chat Monitor
              </h2>
            </div>
            <div className="p-4 h-[470px] overflow-y-auto space-y-3 bg-slate-50">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`text-sm ${msg.role === 'admin' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-3 py-2 rounded-lg ${msg.role === 'admin' ? 'bg-slate-900 text-white' : msg.role === 'system' ? 'bg-amber-100 text-amber-800' : 'bg-white border border-slate-200 text-slate-800'}`}>
                    <div className="text-[11px] opacity-70 mb-1">{msg.name || 'System'}</div>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} className="p-4 border-t border-slate-100 flex gap-2 bg-white">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Reply as admin..." />
              <button className="btn-premium rounded-lg px-4 inline-flex items-center gap-1 text-sm font-semibold" type="submit">
                <Send size={14} /> Send
              </button>
            </form>
          </div>
        </section>
      </Reveal>
    </div>
  );
};

const MetricCard = ({ label, value, tone = 'slate' }) => {
  const tones = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  return (
    <motion.div whileHover={{ y: -2 }} className={`rounded-xl border p-4 ${tones[tone] || tones.slate}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">
        <AnimatedNumber value={value || 0} className="inline" />
      </p>
    </motion.div>
  );
};

export default AdminSupport;
