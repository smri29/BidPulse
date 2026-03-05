import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Users, Eye, History } from 'lucide-react';
import { getAllAuctions } from '../../redux/auctionSlice';

const BidderDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { auctions, isLoading } = useSelector((state) => state.auction);

  useEffect(() => {
    dispatch(getAllAuctions({ includeBids: true, includeRegistrations: true, force: true, limit: 200 }));
  }, [dispatch]);

  const registeredFuture = useMemo(
    () =>
      auctions.filter(
        (auction) =>
          auction.status === 'future' &&
          auction.registrations?.some((entry) => String(entry.bidder) === String(user._id))
      ),
    [auctions, user._id]
  );

  const activeSessions = useMemo(
    () =>
      auctions.filter(
        (auction) =>
          auction.status === 'ongoing' &&
          auction.registrations?.some((entry) => String(entry.bidder) === String(user._id))
      ),
    [auctions, user._id]
  );

  const wonAuctions = useMemo(
    () => auctions.filter((auction) => String(auction.winner) === String(user._id)),
    [auctions, user._id]
  );

  const previousParticipations = useMemo(
    () =>
      auctions.filter(
        (auction) =>
          ['completed', 'paid_shipping_pending', 'paid_held_in_escrow', 'closed'].includes(auction.status) &&
          auction.registrations?.some((entry) => String(entry.bidder) === String(user._id))
      ),
    [auctions, user._id]
  );

  if (isLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl border border-cyan-100 bg-white shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900">Bidder Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your registrations, live bidding sessions, and winning history.</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
            <MetricCard label="Future Registrations" value={registeredFuture.length} icon={<Clock size={16} />} tone="blue" />
            <MetricCard label="Ongoing Sessions" value={activeSessions.length} icon={<Users size={16} />} tone="emerald" />
            <MetricCard label="Wins" value={wonAuctions.length} icon={<Trophy size={16} />} tone="amber" />
            <MetricCard label="Previous Participations" value={previousParticipations.length} icon={<History size={16} />} tone="indigo" />
          </div>
        </section>

        <Section title="Future Bids You Registered" emptyText="No future registrations yet." items={registeredFuture} />
        <Section title="Ongoing Bids You Can Join" emptyText="No ongoing sessions for you right now." items={activeSessions} highlightLive />
        <Section title="Previous / Won Bids History" emptyText="No bidding history yet." items={previousParticipations} />
      </div>
    </div>
  );
};

const Section = ({ title, items, emptyText, highlightLive = false }) => (
  <section className="mb-8 rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
    {items.length ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((auction) => (
          <Link
            key={auction._id}
            to={`/auction/${auction._id}`}
            className={`rounded-xl border p-4 hover:shadow-md transition ${
              highlightLive ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-gray-900 mb-1 line-clamp-2">{auction.title}</p>
              <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-gray-100 text-gray-600">
                {auction.status.replaceAll('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-600">Current: <span className="font-semibold text-emerald-700">${auction.currentPrice}</span></p>
            <p className="text-xs text-gray-500 mt-2">Registered bidders: {auction.registrations?.length || 0}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700">
              <Eye size={14} /> Open Details
            </div>
          </Link>
        ))}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">{emptyText}</div>
    )}
  </section>
);

const MetricCard = ({ label, value, icon, tone = 'blue' }) => {
  const toneMap = {
    blue: 'text-blue-700 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-700 bg-amber-50 border-amber-100',
    indigo: 'text-indigo-700 bg-indigo-50 border-indigo-100',
  };

  return (
    <div className={`rounded-xl border p-4 ${toneMap[tone] || toneMap.blue}`}>
      <p className="text-xs uppercase tracking-wide flex items-center gap-2 font-semibold">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
};

export default BidderDashboard;
