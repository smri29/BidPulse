import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import axios from '../../utils/axiosConfig';
import { useSupportRoom } from '../support/useSupportRoom';

export const useAdminSupportData = () => {
  const { user } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [ticketSearch, setTicketSearch] = useState('');

  const authConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${user?.token}` } }), [user?.token]);
  const { chatInput, setChatInput, chatMessages, sendLiveMessage } = useSupportRoom({ enabled: Boolean(user?.token), user: { ...user, role: 'admin' } });

  const ticketMetrics = useMemo(() => {
    const open = tickets.filter((item) => item.status === 'open').length;
    const inProgress = tickets.filter((item) => item.status === 'in_progress').length;
    const resolved = tickets.filter((item) => item.status === 'resolved').length;
    return { total: tickets.length, open, inProgress, resolved, liveMessages: chatMessages.length };
  }, [chatMessages.length, tickets]);

  const filteredTickets = useMemo(() => {
    const query = ticketSearch.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesQuery = !query || [ticket.subject, ticket.name, ticket.email, ticket.message].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus = ticketFilter === 'all' || ticket.status === ticketFilter;
      return matchesQuery && matchesStatus;
    });
  }, [ticketFilter, ticketSearch, tickets]);

  const fetchTickets = async () => {
    try {
      const { data } = await axios.get('/support/tickets', authConfig);
      setTickets(data || []);
    } catch {
      toast.error('Failed to fetch support tickets');
    }
  };

  useEffect(() => {
    if (!user?.token) return;
    fetchTickets();
  }, [user?.token]);

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await axios.put(`/support/tickets/${ticketId}`, { status }, authConfig);
      setTickets((prev) => prev.map((ticket) => (ticket._id === ticketId ? { ...ticket, status } : ticket)));
      toast.success('Ticket updated');
    } catch {
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

  return {
    tickets,
    ticketFilter,
    setTicketFilter,
    ticketSearch,
    setTicketSearch,
    ticketMetrics,
    filteredTickets,
    chatInput,
    setChatInput,
    chatMessages,
    sendLiveMessage,
    updateTicketStatus,
    sendTestEmail,
  };
};
