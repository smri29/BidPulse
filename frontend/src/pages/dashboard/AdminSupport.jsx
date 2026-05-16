import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { motion } from 'motion/react';
import { toast } from 'react-toastify';
import {
  Headphones,
  MailCheck,
  MessageCircle,
  Search,
  Send,
  ShieldAlert,
  Ticket,
} from 'lucide-react';
import axios, { socketUrl } from '../../utils/axiosConfig';
import Reveal from '../../components/ui/Reveal';
import AnimatedNumber from '../../components/ui/AnimatedNumber';

// Admin support page merges ticket queue management with the live support-room chat monitor.
const AdminSupport = () => {
  const { user } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [ticketSearch, setTicketSearch] = useState('');
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
      liveMessages: chatMessages.length,
    };
  }, [chatMessages.length, tickets]);

  const filteredTickets = useMemo(() => {
    const query = ticketSearch.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesQuery =
        !query ||
        [ticket.subject, ticket.name, ticket.email, ticket.message]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus = ticketFilter === 'all' || ticket.status === ticketFilter;
      return matchesQuery && matchesStatus;
    });
  }, [ticketFilter, ticketSearch, tickets]);

  const fetchTickets = async () => {
    try {
      const { data } = await axios.get('/support/tickets', authConfig);
      setTickets(data || []);
    } catch (_error) {
      toast.error('Failed to fetch support tickets');
    }
  };

  useEffect(() => {
    if (!user?.token) return;
    fetchTickets();
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) return undefined;

    if (!socketRef.current) {
      socketRef.current = io(socketUrl, { transports: ['websocket', 'polling'] });
    }

    const socket = socketRef.current;
    socket.emit('support:join', { name: user?.name || 'Support Admin', role: 'admin' });
    socket.on('support:message', (payload) => setChatMessages((prev) => [...prev, payload]));
    socket.on('support:system', (payload) =>
      setChatMessages((prev) => [...prev, { ...payload, role: 'system' }])
    );

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
      setTickets((prev) =>
        prev.map((ticket) => (ticket._id === ticketId ? { ...ticket, status } : ticket))
      );
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
        <section className="premium-panel mb-6 rounded-2xl p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
                <Headphones className="text-bid-purple" /> Support Operations
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Track incoming tickets, respond faster in live support, and keep communication tools
                healthy from one calmer admin workspace.
              </p>
            </div>
            <button
              onClick={sendTestEmail}
              className="btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
              type="button"
            >
              <MailCheck size={16} /> Send Test Email
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Tickets" value={ticketMetrics.total} icon={<Ticket size={15} />} tone="blue" />
            <MetricCard label="Open" value={ticketMetrics.open} icon={<ShieldAlert size={15} />} tone="amber" />
            <MetricCard
              label="In Progress"
              value={ticketMetrics.inProgress}
              icon={<MessageCircle size={15} />}
              tone="indigo"
            />
            <MetricCard
              label="Resolved"
              value={ticketMetrics.resolved}
              icon={<MailCheck size={15} />}
              tone="emerald"
            />
            <MetricCard
              label="Live Messages"
              value={ticketMetrics.liveMessages}
              icon={<Send size={15} />}
              tone="slate"
            />
          </div>
        </section>
      </Reveal>

      <Reveal delay={80}>
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <div className="premium-panel overflow-hidden rounded-2xl">
            <div className="border-b border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 font-bold text-slate-900">
                    <Ticket size={18} className="text-bid-purple" /> Support Tickets
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Review every request, then move it from open to resolved with a cleaner ticket queue.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_190px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm"
                      placeholder="Search subject, user, or message"
                    />
                  </div>
                  <select
                    value={ticketFilter}
                    onChange={(e) => setTicketFilter(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="all">All Tickets</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="max-h-[620px] divide-y divide-slate-100 overflow-y-auto bg-white">
              {filteredTickets.length === 0 ? (
                <div className="flex min-h-[280px] items-center justify-center p-8 text-center text-sm text-slate-500">
                  No support tickets matched the current search and status filter.
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <motion.div key={ticket._id} whileHover={{ y: -1 }} className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{ticket.subject}</p>
                          <TicketStatusBadge status={ticket.status} />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>{ticket.name}</span>
                          <span>{ticket.email}</span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-slate-700">{ticket.message}</p>
                      </div>

                      <div className="flex flex-col gap-2 xl:w-44">
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Update Status
                        </label>
                        <select
                          value={ticket.status}
                          onChange={(e) => updateTicketStatus(ticket._id, e.target.value)}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="premium-panel overflow-hidden rounded-2xl">
            <div className="border-b border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-bold text-slate-900">
                    <MessageCircle size={18} className="text-emerald-600" /> Live Support Monitor
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Watch active support traffic and reply directly as the admin support desk.
                  </p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {chatMessages.length} message{chatMessages.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <div className="h-[520px] space-y-3 overflow-y-auto bg-slate-50 p-4">
              {chatMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                  Waiting for live support activity.
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-sm ${msg.role === 'admin' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block max-w-[88%] rounded-2xl px-3 py-2.5 ${
                        msg.role === 'admin'
                          ? 'bg-slate-900 text-white'
                          : msg.role === 'system'
                            ? 'bg-amber-100 text-amber-800'
                            : 'border border-slate-200 bg-white text-slate-800'
                      }`}
                    >
                      <div className="mb-1 text-[11px] opacity-70">{msg.name || 'System'}</div>
                      <div className="leading-relaxed">{msg.message}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendChat} className="border-t border-slate-100 bg-white p-4">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                  placeholder="Reply as admin..."
                />
                <button
                  className="btn-premium inline-flex items-center gap-1 rounded-xl px-4 text-sm font-semibold"
                  type="submit"
                >
                  <Send size={14} /> Send
                </button>
              </div>
            </form>
          </div>
        </section>
      </Reveal>
    </div>
  );
};

const MetricCard = ({ label, value, icon, tone = 'slate' }) => {
  const tones = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  return (
    <motion.div whileHover={{ y: -2 }} className={`rounded-xl border p-4 ${tones[tone] || tones.slate}`}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        <AnimatedNumber value={value || 0} className="inline" />
      </p>
    </motion.div>
  );
};

const TicketStatusBadge = ({ status }) => {
  const toneMap = {
    open: 'border-amber-200 bg-amber-50 text-amber-700',
    in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
    resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        toneMap[status] || 'border-slate-200 bg-slate-50 text-slate-700'
      }`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
};

export default AdminSupport;
