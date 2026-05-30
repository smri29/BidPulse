/**
 * Module: features/sellerDashboard/SellerDashboardPage.jsx
 * Purpose: Renders the Seller Dashboard Page screen by composing smaller feature-specific sections.
 */
import React from 'react';

import SellerDashboardHero from './components/sections/SellerDashboardHero';
import SellerInsightsSection from './components/sections/SellerInsightsSection';
import SellerListingDrilldownSection from './components/sections/SellerListingDrilldownSection';
import SellerListingsSection from './components/sections/SellerListingsSection';
import { exportBidHistoryCsv, exportEarningsCsv, exportSummaryPdf } from './exporters';
import { useSellerDashboardData } from './useSellerDashboardData';

const SellerDashboardPage = () => {
  const {
    user,
    isLoading,
    myAuctions,
    selectedListingId,
    setSelectedListingId,
    selectedListing,
    metrics,
    statusDistribution,
    bidTrend,
    listingInsights,
    handleDelete,
  } = useSellerDashboardData();

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SellerDashboardHero
          onExportBidHistory={() => exportBidHistoryCsv(myAuctions)}
          onExportEarnings={() => exportEarningsCsv(myAuctions)}
          onExportSummary={() => exportSummaryPdf({ user, metrics, myAuctions })}
        />
        <SellerInsightsSection
          metrics={metrics}
          bidTrend={bidTrend}
          statusDistribution={statusDistribution}
          listingInsights={listingInsights}
          selectedListingId={selectedListingId}
          onSelectListing={setSelectedListingId}
        />
        <SellerListingsSection
          myAuctions={myAuctions}
          isLoading={isLoading}
          onDelete={handleDelete}
          onSelectListing={setSelectedListingId}
        />
        <SellerListingDrilldownSection selectedListing={selectedListing} />
      </div>
    </div>
  );
};

export default SellerDashboardPage;
