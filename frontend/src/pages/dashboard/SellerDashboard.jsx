import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DollarSign,
  Plus,
  Users,
  Gavel,
  BarChart3,
  TrendingUp,
  Clock3,
  Trophy,
  Eye,
  Trash2,
  Download,
  FileText,
} from 'lucide-react';
import { getAllAuctions, deleteAuction } from '../../redux/auctionSlice';
import { getAuctionImage, handleAuctionImageError } from '../../utils/imageUrl';

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { auctions, isLoading } = useSelector((state) => state.auction);
  const [selectedListingId, setSelectedListingId] = useState(null);

  useEffect(() => {
    if (user?._id) {
      dispatch(
        getAllAuctions({
          seller: user._id,
          includeRegistrations: true,
          includeBids: true,
          force: true,
          limit: 300,
        })
      );
    }
  }, [dispatch, user?._id]);

  const myAuctions = useMemo(
    () => auctions.filter((auction) => String(auction.seller?._id || auction.seller) === String(user._id)),
    [auctions, user._id]
  );

  const selectedListing = useMemo(
    () => myAuctions.find((item) => item._id === selectedListingId) || null,
    [myAuctions, selectedListingId]
  );

  const metrics = useMemo(() => {
    const totalListings = myAuctions.length;
    const liveListings = myAuctions.filter((a) => ['future', 'ongoing'].includes(a.status)).length;
    const totalRegistrations = myAuctions.reduce((sum, a) => sum + (a.registrations?.length || 0), 0);
    const totalBids = myAuctions.reduce((sum, a) => sum + (a.bids?.length || 0), 0);

    const releasedEarnings = myAuctions
      .filter((a) => a.status === 'closed')
      .reduce((sum, a) => sum + a.currentPrice * 0.95, 0);

    const pipelineEarnings = myAuctions
      .filter((a) => ['completed', 'paid_shipping_pending', 'paid_held_in_escrow'].includes(a.status))
      .reduce((sum, a) => sum + a.currentPrice * 0.95, 0);

    const topBid = myAuctions.reduce((max, a) => Math.max(max, Number(a.currentPrice || 0)), 0);

    return {
      totalListings,
      liveListings,
      totalRegistrations,
      totalBids,
      releasedEarnings,
      pipelineEarnings,
      topBid,
    };
  }, [myAuctions]);

  const statusDistribution = useMemo(() => {
    const map = {};
    myAuctions.forEach((a) => {
      map[a.status] = (map[a.status] || 0) + 1;
    });

    return Object.entries(map)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [myAuctions]);

  const bidTrend = useMemo(() => {
    return myAuctions
      .map((a) => ({
        id: a._id,
        label: a.title,
        createdAt: new Date(a.createdAt).getTime(),
        bidCount: a.bids?.length || 0,
      }))
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [myAuctions]);

  const listingInsights = useMemo(() => {
    return [...myAuctions]
      .map((a) => {
        const registrationCount = a.registrations?.length || 0;
        const bidCount = a.bids?.length || 0;
        const intensity = registrationCount > 0 ? (bidCount / registrationCount).toFixed(2) : '0.00';
        const lastBid = bidCount > 0 ? a.bids[bidCount - 1] : null;
        return {
          ...a,
          registrationCount,
          bidCount,
          intensity,
          lastBid,
        };
      })
      .sort((a, b) => b.bidCount - a.bidCount)
      .slice(0, 6);
  }, [myAuctions]);

  const triggerCsvDownload = (filename, headers, rows) => {
    const csvRows = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBidHistoryCsv = () => {
    const rows = myAuctions.flatMap((auction) =>
      (auction.bids || []).map((bid) => [
        auction.title,
        auction.category,
        auction.status,
        bid.bidder?.name || 'Bidder',
        bid.amount,
        new Date(bid.time).toLocaleString(),
      ])
    );

    if (!rows.length) {
      return;
    }

    triggerCsvDownload(
      `seller-bid-history-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Listing', 'Category', 'Status', 'Bidder', 'Bid Amount', 'Bid Time'],
      rows
    );
  };

  const exportEarningsCsv = () => {
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

    if (!rows.length) {
      return;
    }

    triggerCsvDownload(
      `seller-earnings-report-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Listing', 'Status', 'Gross', 'Commission (5%)', 'Net Seller (95%)', 'Winner'],
      rows
    );
  };

  const exportSummaryPdf = async () => {
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
    myAuctions.forEach((auction, idx) => {
      writeLine(
        `${idx + 1}. ${auction.title} | ${auction.status} | Current: $${auction.currentPrice} | Bids: ${
          auction.bids?.length || 0
        } | Registered: ${auction.registrations?.length || 0}`
      );
    });

    doc.save(`seller-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this listing permanently?')) {
      dispatch(deleteAuction(id));
      if (selectedListingId === id) setSelectedListingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <section className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track listing lifecycle, registrations, bids, and payout performance.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportBidHistoryCsv}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-200"
              >
                <Download size={16} /> Bid History CSV
              </button>
              <button
                onClick={exportEarningsCsv}
                className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-200"
              >
                <Download size={16} /> Earnings CSV
              </button>
              <button
                onClick={exportSummaryPdf}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-slate-800"
              >
                <FileText size={16} /> Summary PDF
              </button>
              <Link
                to="/create-auction"
                className="inline-flex items-center gap-2 bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-emerald-800"
              >
                <Plus size={18} /> Submit Product
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <KpiCard label="Released Earnings" value={metrics.releasedEarnings} prefix="$" icon={<DollarSign size={16} />} tone="emerald" />
          <KpiCard label="In Pipeline (95%)" value={metrics.pipelineEarnings} prefix="$" icon={<TrendingUp size={16} />} tone="indigo" />
          <KpiCard label="Total Registrations" value={metrics.totalRegistrations} icon={<Users size={16} />} tone="blue" isCount />
          <KpiCard label="Total Bids" value={metrics.totalBids} icon={<Gavel size={16} />} tone="amber" isCount />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
              <BarChart3 size={17} /> Bid Trend Across Listings
            </h2>
            <LineChart points={bidTrend} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Listing Status Distribution</h2>
            <StatusBars items={statusDistribution} />
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <MiniMetric label="Total Listings" value={metrics.totalListings} />
              <MiniMetric label="Live Listings" value={metrics.liveListings} />
              <MiniMetric label="Highest Current Bid" value={`$${metrics.topBid.toLocaleString()}`} />
              <MiniMetric label="Commission Rate" value="5%" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Listing Insights</h2>
          {listingInsights.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {listingInsights.map((listing) => (
                <button
                  key={listing._id}
                  type="button"
                  onClick={() => setSelectedListingId(listing._id)}
                  className={`text-left rounded-xl border p-4 transition hover:shadow-md ${
                    selectedListingId === listing._id ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className="font-semibold text-gray-900 truncate">{listing.title}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase">{listing.status.replaceAll('_', ' ')}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <InsightValue label="Registered" value={listing.registrationCount} />
                    <InsightValue label="Bids" value={listing.bidCount} />
                    <InsightValue label="Bid Intensity" value={listing.intensity} />
                    <InsightValue label="Current" value={`$${listing.currentPrice}`} />
                  </div>
                  {listing.lastBid ? (
                    <p className="mt-3 text-xs text-gray-600 inline-flex items-center gap-1">
                      <Clock3 size={12} /> Last bid: ${listing.lastBid.amount}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-gray-400">No bids yet</p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No listing insights available yet.</p>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">My Listings</h2>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-gray-500">Loading your listings...</div>
          ) : myAuctions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3.5">Item</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Registered</th>
                    <th className="px-6 py-3.5">Bids</th>
                    <th className="px-6 py-3.5">Winner</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myAuctions.map((auction) => (
                    <tr key={auction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAuctionImage(auction.images)}
                            alt={auction.title}
                            onError={handleAuctionImageError}
                            className="h-11 w-11 rounded-md border border-gray-200 object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{auction.title}</p>
                            <p className="text-xs text-gray-500">{auction.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-700">${auction.startingPrice} / ${auction.currentPrice}</td>
                      <td className="px-6 py-4"><StatusBadge status={auction.status} /></td>
                      <td className="px-6 py-4">{auction.registrations?.length || 0}</td>
                      <td className="px-6 py-4">{auction.bids?.length || 0}</td>
                      <td className="px-6 py-4">{auction.winner?.name || (auction.winner ? 'Winner selected' : 'N/A')}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => setSelectedListingId(auction._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold"
                          >
                            <Eye size={13} /> Analytics
                          </button>
                          <Link to={`/auction/${auction._id}`} className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs font-semibold">
                            Details
                          </Link>
                          <button
                            onClick={() => handleDelete(auction._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-red-100 text-red-700 text-xs font-semibold"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-14 text-center text-gray-500">No listings yet.</div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
            <Trophy size={17} /> Listing Drill-down
          </h2>
          {selectedListing ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-1 rounded-xl border border-gray-200 p-4 bg-gray-50">
                <img
                  src={getAuctionImage(selectedListing.images)}
                  alt={selectedListing.title}
                  onError={handleAuctionImageError}
                  className="w-full h-44 object-cover rounded-lg border border-gray-200 mb-3"
                />
                <p className="font-semibold text-gray-900">{selectedListing.title}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedListing.description}</p>
                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  <p><b>Status:</b> {selectedListing.status.replaceAll('_', ' ')}</p>
                  <p><b>Current Price:</b> ${selectedListing.currentPrice}</p>
                  <p><b>Registered:</b> {selectedListing.registrations?.length || 0}</p>
                  <p><b>Total Bids:</b> {selectedListing.bids?.length || 0}</p>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Bid Timeline</h3>
                {selectedListing.bids?.length ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {[...selectedListing.bids].reverse().map((bid, index) => (
                      <div key={`${bid.time}-${index}`} className="rounded-lg border border-gray-100 p-3 bg-gray-50 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{bid.bidder?.name || 'Bidder'}</p>
                          <p className="text-xs text-gray-500">{new Date(bid.time).toLocaleString()}</p>
                        </div>
                        <p className="text-sm font-bold text-emerald-700">${bid.amount}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No bids on this listing yet.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a listing from the insights or table to view detailed bidding analytics.</p>
          )}
        </section>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, prefix = '', icon, tone = 'emerald', isCount = false }) => {
  const toneMap = {
    emerald: 'text-emerald-700',
    indigo: 'text-indigo-700',
    blue: 'text-blue-700',
    amber: 'text-amber-700',
  };

  const displayValue = isCount
    ? Number(value || 0).toLocaleString()
    : Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
        {icon}
        {label}
      </p>
      <p className={`text-2xl font-bold mt-2 ${toneMap[tone] || toneMap.emerald}`}>
        {prefix}
        {displayValue}
      </p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styleMap = {
    pending_verification: 'bg-amber-100 text-amber-700',
    future: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-indigo-100 text-indigo-700',
    paid_shipping_pending: 'bg-sky-100 text-sky-700',
    paid_held_in_escrow: 'bg-sky-100 text-sky-700',
    closed: 'bg-slate-800 text-white',
    no_registrations: 'bg-orange-100 text-orange-700',
    withdrawn: 'bg-gray-200 text-gray-700',
    disapproved: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styleMap[status] || styleMap.withdrawn}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
};

const MiniMetric = ({ label, value }) => (
  <div className="rounded-lg border border-gray-200 p-2.5 bg-gray-50">
    <p className="text-[11px] uppercase text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
  </div>
);

const InsightValue = ({ label, value }) => (
  <div className="rounded-md border border-gray-200 p-2 bg-gray-50">
    <p className="text-[10px] uppercase text-gray-500">{label}</p>
    <p className="text-xs font-semibold text-gray-900 mt-1">{value}</p>
  </div>
);

const LineChart = ({ points }) => {
  if (!points.length) {
    return <p className="text-sm text-gray-500">No listing trend data available yet.</p>;
  }

  const width = 720;
  const height = 220;
  const pad = 24;
  const maxY = Math.max(...points.map((p) => p.bidCount), 1);

  const mapped = points.map((p, i) => {
    const x = pad + (i * (width - pad * 2)) / Math.max(points.length - 1, 1);
    const y = height - pad - (p.bidCount / maxY) * (height - pad * 2);
    return { ...p, x, y };
  });

  const path = mapped.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[560px]">
        <rect x="0" y="0" width={width} height={height} fill="#f8fafc" rx="12" />
        <path d={path} fill="none" stroke="#059669" strokeWidth="3" />
        {mapped.map((p) => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r="4" fill="#047857" />
          </g>
        ))}
      </svg>
    </div>
  );
};

const StatusBars = ({ items }) => {
  if (!items.length) {
    return <p className="text-sm text-gray-500">No listing status data yet.</p>;
  }

  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.status}>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span className="uppercase">{item.status.replaceAll('_', ' ')}</span>
            <span>{item.count}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SellerDashboard;
