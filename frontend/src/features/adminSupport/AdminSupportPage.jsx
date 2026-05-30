import React from 'react';

import Reveal from '../../components/ui/Reveal';
import { useAdminSupportData } from './useAdminSupportData';
import AdminSupportChatPanel from './components/sections/AdminSupportChatPanel';
import AdminSupportHeader from './components/sections/AdminSupportHeader';
import AdminSupportTicketsPanel from './components/sections/AdminSupportTicketsPanel';

const AdminSupportPage = () => {
  const {
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
  } = useAdminSupportData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AdminSupportHeader ticketMetrics={ticketMetrics} sendTestEmail={sendTestEmail} />

      <Reveal delay={80}>
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <AdminSupportTicketsPanel
            ticketFilter={ticketFilter}
            setTicketFilter={setTicketFilter}
            ticketSearch={ticketSearch}
            setTicketSearch={setTicketSearch}
            filteredTickets={filteredTickets}
            updateTicketStatus={updateTicketStatus}
          />
          <AdminSupportChatPanel
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendLiveMessage={sendLiveMessage}
          />
        </section>
      </Reveal>
    </div>
  );
};

export default AdminSupportPage;
