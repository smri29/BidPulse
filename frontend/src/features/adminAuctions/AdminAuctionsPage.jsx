/**
 * Module: features/adminAuctions/AdminAuctionsPage.jsx
 * Purpose: Renders the Admin Auctions Page screen by composing smaller feature-specific sections.
 */
import React from 'react';
import { AlertCircle } from 'lucide-react';

import { useAdminAuctionsData } from './useAdminAuctionsData';
import AuctionModerationModal from './components/AuctionModerationModal';
import AdminAuctionsFilters from './components/AdminAuctionsFilters';
import AdminAuctionsHeader from './components/AdminAuctionsHeader';
import AdminAuctionsList from './components/AdminAuctionsList';

const AdminAuctionsPage = () => {
  const {
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filtered,
    auctionMetrics,
    selectedAuction,
    setSelectedAuction,
    registrationWindowDays,
    setRegistrationWindowDays,
    registrationTestMinutes,
    setRegistrationTestMinutes,
    customEndAt,
    setCustomEndAt,
    disapproveReason,
    setDisapproveReason,
    handleDeleteAuction,
    openDetails,
    handleApprove,
    handleDisapprove,
  } = useAdminAuctionsData();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-red-600">
        <AlertCircle size={20} /> {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AdminAuctionsHeader auctionMetrics={auctionMetrics} />
      <AdminAuctionsFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <AdminAuctionsList
        filtered={filtered}
        openDetails={openDetails}
        handleDeleteAuction={handleDeleteAuction}
      />

      <AuctionModerationModal
        selectedAuction={selectedAuction}
        onClose={() => setSelectedAuction(null)}
        registrationWindowDays={registrationWindowDays}
        setRegistrationWindowDays={setRegistrationWindowDays}
        registrationTestMinutes={registrationTestMinutes}
        setRegistrationTestMinutes={setRegistrationTestMinutes}
        customEndAt={customEndAt}
        setCustomEndAt={setCustomEndAt}
        disapproveReason={disapproveReason}
        setDisapproveReason={setDisapproveReason}
        onApprove={handleApprove}
        onDisapprove={handleDisapprove}
      />
    </div>
  );
};

export default AdminAuctionsPage;
