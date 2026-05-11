import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock3, Eye, History, Trophy, Users } from 'lucide-react';
import { getAllAuctions } from '../../redux/auctionSlice';
import Reveal from '../../components/ui/Reveal';
import AnimatedNumber from '../../components/ui/AnimatedNumber';

const BidderDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { auctions, isLoading } = useSelector((state) => state.auction);

  useEffect(() => {
    if (!user?._id) return;
    dispatch(getAllAuctions({ includeBids: true, includeRegistrations: true, force: true, limit: 200 }));
  }, [dispatch, user?._id]);

  const registeredFuture = useMemo(
    () =>
      auctions.filter(
        (auction) =>
          auction.status === 'future' &&
          auction.registrations?.some((entry) => String(entry.bidder) === String(user?._id))
      ),
    [auctions, user?._id]
  );

  const activeSessions = useMemo(
    () =>
      auctions.filter(
        (auction) =>
          auction.status === 'ongoing' &&
          auction.registrations?.some((entry) => String(entry.bidder) === String(user?._id))
      ),
    [auctions, user?._id]
  );

  const wonAuctions = useMemo(
    () => auctions.filter((auction) => String(auction.winner) === String(user?._id)),
    [auctions, user?._id]
  );

  const previousParticipations = useMemo(
    () =>
      auctions.filter(
        (auction) =>
          ['completed', 'paid_shipping_pending', 'paid_held_in_escrow', 'closed'].includes(auction.status) &&
          auction.registrations?.some((entry) => String(entry.bidder) === String(user?._id))
      ),
    [auctions, user?._id]
  );

  const registrationCoverage = useMemo(() => {
    const possibleFuture = auctions.filter((item) => item.status === 'future').length;
    if (!possibleFuture) return 0;
    return Math.min(100, Math.round((registeredFuture.length / possibleFuture) * 100));
  }, [auctions, registeredFuture.length]);

  if (isLoading) {
    return <div className="p-10 text-center text-slate-500">Loading buyer analytics...</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <section className="premium-panel rounded-2xl p-6 mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Buyer Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Track registrations, join live sessions quickly, and monitor your win momentum.</p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Future Registrations" value={registeredFuture.length} icon={<Clock3 size={16} />} tone="blue" />
              <MetricCard label="Ongoing Sessions" value={activeSessions.length} icon={<Users size={16} />} tone="emerald" />
              <MetricCard label="Wins" value={wonAuctions.length} icon={<Trophy size={16} />} tone="amber" />
              <MetricCard label="Past Participations" value={previousParticipations.length} icon={<History size={16} />} tone="indigo" />
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white/85 p-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="uppercase tracking-wide font-semibold">Future Registration Coverage</span>
                <span className="font-bold text-slate-700">{registrationCoverage}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${registrationCoverage}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="h-2 bg-gradient-to-r from-blue-600 to-cyan-500"
                />
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal delay={60}>
          <Section
            title="Upcoming Auctions You Registered"
            emptyText="No future registrations yet."
            items={registeredFuture}
            tagTone="bg-blue-100 text-blue-700"
          />
        </Reveal>

        <Reveal delay={90}>
          <Section
            title="Live Auctions You Can Join"
            emptyText="No ongoing sessions for you right now."
            items={activeSessions}
            highlightLive
            tagTone="bg-emerald-100 text-emerald-700"
          />
        </Reveal>

        <Reveal delay={120}>
          <Section
            title="Previous / Won Auction History"
            emptyText="No auction history yet."
            items={previousParticipations}
            tagTone="bg-indigo-100 text-indigo-700"
          />
        </Reveal>
      </div>
    </div>
  );
};

const Section = ({ title, items, emptyText, highlightLive = false, tagTone = 'bg-slate-100 text-slate-700' }) => (
  <section className="premium-panel mb-8 rounded-2xl p-5">
    <h2 className="mb-4 text-xl font-semibold text-slate-900">{title}</h2>
    {items.length ? (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((auction, index) => (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={auction._id}
          >
            <Link
              to={`/auction/${auction._id}`}
              className={`block rounded-xl border p-4 transition hover:-translate-y-[2px] hover:shadow-lg ${
                highlightLive
                  ? 'border-emerald-200 bg-emerald-50/35'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="mb-1 font-semibold text-slate-900">{auction.title}</p>
                <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${tagTone}`}>
                  {auction.status.replaceAll('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Current: <span className="font-semibold text-emerald-700">${auction.currentPrice}</span>
              </p>
              <p className="mt-2 text-xs text-slate-500">Registered participants: {auction.registrations?.length || 0}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                <Eye size={14} /> Open Details
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">{emptyText}</div>
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
    <motion.div whileHover={{ y: -2 }} className={`rounded-xl border p-4 ${toneMap[tone] || toneMap.blue}`}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        {icon}
        {label}
      </p>
      <AnimatedNumber value={value} className="mt-2 block text-2xl font-bold" />
    </motion.div>
  );
};

export default BidderDashboard;
