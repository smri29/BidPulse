import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { MessageCircle, Send, Ticket, MailCheck } from 'lucide-react';
import axios, { socketUrl } from '../../utils/axiosConfig';

const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

const AdminSupport = () => {
  const { user } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  const authConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${user?.token}` } }),
    [user?.token]
  );

  const fetchTickets = async () => {
    try {
      const { data } = await axios.get(`/support/tickets?status=${ticketFilter}`, authConfig);
      setTickets(data);
    } catch (error) {
      toast.error('Failed to fetch support tickets');
    }
  };

  useEffect(() => {
    if (user?.token) fetchTickets();
  }, [user?.token, ticketFilter]);

  useEffect(() => {
    socket.emit('support:join', { name: user?.name || 'Support Admin', role: 'admin' });
    socket.on('support:message', (payload) => setChatMessages((prev) => [...prev, payload]));
    socket.on('support:system', (payload) => setChatMessages((prev) => [...prev, { ...payload, role: 'system' }]));
    return () => {
      socket.off('support:message');
      socket.off('support:system');
    };
  }, [user?.name]);

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await axios.put(`/support/tickets/${ticketId}`, { status }, authConfig);
      setTickets((prev) => prev.map((ticket) => (ticket._id === ticketId ? { ...ticket, status } : ticket)));
      toast.success('Ticket updated');
    } catch (error) {
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
    socket.emit('support:message', {
      name: user?.name || 'Support Admin',
      role: 'admin',
      message: chatInput.trim(),
    });
    setChatInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Desk</h1>
        <button onClick={sendTestEmail} className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 hover:bg-black">
          <MailCheck size={16} /> Send Test Email
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Ticket size={18} className="text-bid-purple" /> Support Tickets
            </h2>
            <select value={ticketFilter} onChange={(e) => setTicketFilter(e.target.value)} className="text-sm border border-gray-300 rounded px-2 py-1">
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-100">
            {tickets.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">No tickets found.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket._id} className="p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{ticket.subject}</p>
                      <p className="text-xs text-gray-500">{ticket.name} ({ticket.email})</p>
                      <p className="text-sm text-gray-700 mt-2">{ticket.message}</p>
                    </div>
                    <select
                      value={ticket.status}
                      onChange={(e) => updateTicketStatus(ticket._id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle size={18} className="text-emerald-600" /> Live Chat Monitor
            </h2>
          </div>
          <div className="p-4 h-[470px] overflow-y-auto space-y-3 bg-gray-50">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`text-sm ${msg.role === 'admin' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-3 py-2 rounded-lg ${msg.role === 'admin' ? 'bg-slate-900 text-white' : msg.role === 'system' ? 'bg-amber-100 text-amber-800' : 'bg-white border border-gray-200 text-gray-800'}`}>
                  <div className="text-[11px] opacity-70 mb-1">{msg.name || 'System'}</div>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="p-4 border-t border-gray-100 flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Reply as admin..." />
            <button className="bg-emerald-600 text-white rounded-lg px-4 inline-flex items-center gap-1 text-sm font-semibold hover:bg-emerald-700">
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
