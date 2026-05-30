export const triggerCsvDownload = (filename, headers, rows) => {
  const csvRows = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const exportBidHistoryCsv = (myAuctions) => {
  const rows = myAuctions.flatMap((auction) =>
    (auction.bids || []).map((bid) => [
      auction.title,
      auction.category,
      auction.status,
      bid.bidder?.name || 'Participant',
      bid.amount,
      new Date(bid.time).toLocaleString(),
    ])
  );

  if (!rows.length) return false;

  triggerCsvDownload(
    `seller-bid-history-${new Date().toISOString().slice(0, 10)}.csv`,
    ['Listing', 'Category', 'Status', 'Participant', 'Offer Amount', 'Offer Time'],
    rows
  );
  return true;
};

export const exportEarningsCsv = (myAuctions) => {
  const rows = myAuctions.map((auction) => {
    const gross = Number(auction.currentPrice || 0);
    const commission = gross * 0.05;
    const net = gross - commission;
    return [
      auction.title,
      auction.status,
      auction.currentPrice,
      commission.toFixed(2),
      net.toFixed(2),
      auction.winner?.name || 'N/A',
    ];
  });

  if (!rows.length) return false;

  triggerCsvDownload(
    `seller-earnings-report-${new Date().toISOString().slice(0, 10)}.csv`,
    ['Listing', 'Status', 'Gross', 'Commission (5%)', 'Net Seller (95%)', 'Winner'],
    rows
  );
  return true;
};

export const exportSummaryPdf = async ({ user, metrics, myAuctions }) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const lineHeight = 7;
  let y = 16;

  const writeLine = (text) => {
    if (y > 280) {
      doc.addPage();
      y = 16;
    }
    doc.text(String(text), 14, y);
    y += lineHeight;
  };

  doc.setFontSize(16);
  writeLine('Seller Dashboard Summary Report');
  doc.setFontSize(11);
  writeLine(`Generated: ${new Date().toLocaleString()}`);
  writeLine(`Seller: ${user?.name || 'Seller'} (${user?.email || 'N/A'})`);
  y += 3;

  writeLine(`Total Listings: ${metrics.totalListings}`);
  writeLine(`Live Listings: ${metrics.liveListings}`);
  writeLine(`Total Registrations: ${metrics.totalRegistrations}`);
  writeLine(`Total Bids: ${metrics.totalBids}`);
  writeLine(`Released Earnings (95%): $${metrics.releasedEarnings.toFixed(2)}`);
  writeLine(`Pipeline Earnings (95%): $${metrics.pipelineEarnings.toFixed(2)}`);
  y += 3;

  writeLine('Listings:');
  myAuctions.forEach((auction, index) => {
    writeLine(
      `${index + 1}. ${auction.title} | ${auction.status} | Current: $${auction.currentPrice} | Bids: ${
        auction.bids?.length || 0
      } | Registered: ${auction.registrations?.length || 0}`
    );
  });

  doc.save(`seller-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
};
