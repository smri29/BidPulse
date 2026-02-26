import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllAuctions } from '../redux/auctionSlice';
import AuctionCard from '../components/cards/AuctionCard';
import { Loader, Sparkles, Zap, ArrowRight, ShieldCheck, TimerReset, Radio } from 'lucide-react';

const WATCHLIST_KEY = 'bidpulse_watchlist';

const Home = () => {
  const dispatch = useDispatch();
  const { auctions, isLoading } = useSelector((state) => state.auction);
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    dispatch(getAllAuctions({ status: 'active', includeBids: false }));
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const activeAuctions = auctions.filter((a) => a.status === 'active');
  const spotlight = activeAuctions.slice(0, 4);

  const watchedAuctions = useMemo(
    () => activeAuctions.filter((auction) => watchlist.includes(auction._id)),
    [activeAuctions, watchlist]
  );

  const toggleWatch = (auctionId) => {
    setWatchlist((prev) =>
      prev.includes(auctionId) ? prev.filter((id) => id !== auctionId) : [...prev, auctionId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-700 text-white p-8 md:p-12 mb-12 animate-fade-up">
        <div className="absolute -top-16 -right-12 w-56 h-56 rounded-full bg-white/10 blur-2xl animate-float"></div>
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-cyan-300/20 blur-3xl"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold mb-4">
            <Radio size={13} /> Live Escrow Auction Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">Where verified people bid in real time</h1>
          <p className="text-white/85 mb-6 text-base md:text-lg">Trust-first bidding with instant updates, secure checkout, and escrow-backed payouts.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/how-it-works" className="bg-white text-slate-900 px-5 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-slate-100">
              Explore Workflow <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="bg-white/15 border border-white/30 px-5 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-white/20">
              Join BidPulse
            </Link>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-bid-purple" size={48} />
        </div>
      ) : activeAuctions.length === 0 ? (
        <section className="animate-fade-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">No live bids yet</h2>
            <p className="text-gray-600">Kickstart the marketplace by listing the first premium auction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <FeatureCard icon={<ShieldCheck size={18} />} title="Verified Bidders" desc="Only verified emails can bid and list auctions." />
            <FeatureCard icon={<TimerReset size={18} />} title="Anti-Sniping" desc="Late bids extend auction time to keep outcomes fair." />
            <FeatureCard icon={<Zap size={18} />} title="Escrow Payments" desc="Funds release only after delivery confirmation." />
          </div>

          <div className="text-center bg-white/80 rounded-2xl border border-gray-200 p-8">
            <p className="text-gray-700 mb-4">Be the first to create momentum on BidPulse.</p>
            <Link to="/create-auction" className="bg-bid-purple hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
              List Your First Auction <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-5 inline-flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" /> Spotlight Auctions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {spotlight.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} watched={watchlist.includes(auction._id)} onToggleWatch={toggleWatch} />
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Your Watchlist</h2>
            {watchedAuctions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {watchedAuctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} watched={watchlist.includes(auction._id)} onToggleWatch={toggleWatch} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white/70 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm">Save auctions to your watchlist to monitor them instantly.</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">All Live Auctions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeAuctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} watched={watchlist.includes(auction._id)} onToggleWatch={toggleWatch} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 animate-fade-up">
    <div className="w-10 h-10 rounded-lg bg-blue-50 text-bid-purple flex items-center justify-center mb-3">{icon}</div>
    <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

export default Home;
