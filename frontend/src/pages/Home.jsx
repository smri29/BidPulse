import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Search, Loader, MapPin, CalendarClock, Radio, History, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { getAllAuctions } from '../redux/auctionSlice';
import AuctionCard from '../components/cards/AuctionCard';
import Reveal from '../components/ui/Reveal';
import { AUCTION_CATEGORY_OPTIONS } from '../constants/auctionCategories';

// Home page responsibilities:
// 1. introduce the brand
// 2. fetch and filter auctions
// 3. manage a local watchlist
// 4. allow logged-in users to register for future auctions
const WATCHLIST_KEY = 'AuctionPulse_watchlist';
const LEGACY_WATCHLIST_KEY = 'rizbid_watchlist';

const HERO_MESSAGES = [
  'Verified Auction Intelligence',
  'Queue-Based Live Auctions',
  'Managed Fulfillment You Can Trust',
];

// Homepage auction tabs
// These status groups power the Upcoming, Live, and Past auction sections.
const PHASES = [
  { id: 'future', label: 'Upcoming Auctions', statuses: ['future'] },
  { id: 'ongoing', label: 'Live Auctions', statuses: ['ongoing'] },
  {
    id: 'previous',
    label: 'Past Auctions',
    statuses: ['completed', 'paid_shipping_pending', 'paid_held_in_escrow', 'closed', 'no_registrations', 'withdrawn', 'disapproved'],
  },
];

const loadWatchlist = () => {
  try {
    const current = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || 'null');
    if (Array.isArray(current)) return current;

    const legacy = JSON.parse(localStorage.getItem(LEGACY_WATCHLIST_KEY) || 'null');
    if (Array.isArray(legacy)) {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(legacy));
      return legacy;
    }

    return [];
  } catch {
    return [];
  }
};

const Home = () => {
  const dispatch = useDispatch();
  const { auctions, isLoading } = useSelector((state) => state.auction);
  const { user } = useSelector((state) => state.auth);

  const [activePhase, setActivePhase] = useState('future');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [watchlist, setWatchlist] = useState(() => loadWatchlist());
  const [heroMessageIndex, setHeroMessageIndex] = useState(0);

  useEffect(() => {
    // Home loads a broad auction list because it powers searching, filtering, and phase switching.
    dispatch(getAllAuctions({ includeBids: false, includeRegistrations: true, force: true, limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroMessageIndex((prev) => (prev + 1) % HERO_MESSAGES.length);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, []);

  // Category dropdown options
  // Start with the predefined list, then merge in any categories found in fetched data.
  const categories = useMemo(() => {
    const set = new Set(['All', ...AUCTION_CATEGORY_OPTIONS]);
    auctions.forEach((item) => item.category && set.add(item.category));
    return [...set];
  }, [auctions]);

  const phaseStatuses = useMemo(
    () => PHASES.find((p) => p.id === activePhase)?.statuses || [],
    [activePhase]
  );

  // Main homepage filtering pipeline
  // The final list depends on selected phase tab, selected category, and free-text search.
  const filteredAuctions = useMemo(() => {
    // Filters stack in this order: phase, category, then free-text search.
    const query = search.trim().toLowerCase();
    return auctions.filter((auction) => {
      const byPhase = phaseStatuses.includes(auction.status);
      const byCategory = selectedCategory === 'All' || auction.category === selectedCategory;
      const byQuery = !query || auction.title?.toLowerCase().includes(query) || auction.description?.toLowerCase().includes(query);
      return byPhase && byCategory && byQuery;
    });
  }, [auctions, phaseStatuses, selectedCategory, search]);

  const toggleWatch = (auctionId) => {
    setWatchlist((prev) =>
      prev.includes(auctionId) ? prev.filter((id) => id !== auctionId) : [...prev, auctionId]
    );
  };

  const registerForBid = async (auctionId) => {
    if (!user?.token) {
      toast.error('Login required to register for this auction');
      return;
    }

    try {
      const { data } = await axios.post(
        `/auctions/${auctionId}/register`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success(`Registered successfully. Your number is #${data.registrationNumber}`);
      // Refresh the listing data after registration so counts and button state update immediately.
      dispatch(getAllAuctions({ includeBids: false, includeRegistrations: true, force: true, limit: 200 }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal>
        <section className="premium-panel relative overflow-hidden rounded-3xl p-7 text-slate-900 sm:p-10">
          <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-16 left-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-7">
              <h1 className="text-3xl font-extrabold leading-tight text-bid-dark md:text-5xl">AuctionPulse</h1>

              <div className="h-12 md:h-14">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={HERO_MESSAGES[heroMessageIndex]}
                    initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="text-lg font-semibold text-slate-700 md:text-xl"
                  >
                    {HERO_MESSAGES[heroMessageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link to="/how-it-works" className="btn-premium px-4 py-2 text-sm">
                  Explore Process <ArrowRight size={15} />
                </Link>
                <Link to="/safety" className="btn-soft px-4 py-2 text-sm text-slate-700">
                  Trust & Safety
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:col-span-5">
              <InteractivePulseVisual />
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={80} className="mt-8">
        <section className="premium-panel rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search auctions by title or description"
                className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-9 pr-3"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {/* Phase-switching buttons
                Clicking one of these changes activePhase, which changes the allowed statuses. */}
            {PHASES.map((phase) => {
              const Icon = phase.id === 'future' ? CalendarClock : phase.id === 'ongoing' ? Radio : History;
              return (
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
                    activePhase === phase.id
                      ? 'btn-secondary text-white'
                      : 'btn-soft text-slate-700'
                  }`}
                  type="button"
                >
                  <Icon size={14} /> {phase.label}
                </motion.button>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal delay={120} className="mt-8">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">{PHASES.find((p) => p.id === activePhase)?.label}</h2>
            <p className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600">
              {filteredAuctions.length} listings
            </p>
          </div>

          {isLoading ? (
            <div className="surface-card flex h-52 items-center justify-center rounded-2xl">
              <Loader className="animate-spin text-bid-purple" size={36} />
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="surface-card rounded-2xl border-dashed p-10 text-center text-slate-600">
              No listings found for this view.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAuctions.map((auction, index) => (
                <Reveal key={auction._id} delay={index * 35} y={14}>
                  <AuctionCard
                    auction={auction}
                    userId={user?._id}
                    watched={watchlist.includes(auction._id)}
                    onToggleWatch={toggleWatch}
                    onRegister={registerForBid}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      <Reveal delay={160} className="mt-12">
        <section className="surface-card overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-800">
            <MapPin size={16} className="text-bid-purple" /> AuctionPulse Office Location - Dhanmondi, Dhaka, Bangladesh
          </div>
          <iframe
            title="AuctionPulse location in Dhanmondi, Dhaka, Bangladesh"
            src="https://www.google.com/maps?q=Dhanmondi,+Dhaka,+Bangladesh&output=embed"
            className="h-80 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      </Reveal>

      <p className="mt-4 text-xs text-slate-500">Platform commission: 5% from the final sale amount after successful completion.</p>
    </div>
  );
};

const InteractivePulseVisual = () => {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 16 });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 16 });

  const handlePointerMove = (event) => {
    // Pointer position slightly tilts the hero card for a more premium interactive feel.
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    pointerX.set(x);
    pointerY.set(y);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.div
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="relative h-40 overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700"
    >
      <motion.div
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/40 blur-xl"
        animate={{ scale: [0.95, 1.2, 0.95], opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-10 top-8 h-12 w-12 rounded-full border border-white/40"
        animate={{ y: [0, 10, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-7 right-12 h-14 w-14 rounded-full border border-cyan-200/60"
        animate={{ y: [0, -11, 0], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2.9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-wider text-cyan-100/90">
        Interactive Market Pulse
      </div>
    </motion.div>
  );
};

export default Home;
