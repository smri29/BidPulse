import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Loader, MapPin, CalendarClock, Radio, History } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { getAllAuctions } from '../redux/auctionSlice';
import AuctionCard from '../components/cards/AuctionCard';

const WATCHLIST_KEY = 'rizbid_watchlist';

const PHASES = [
  { id: 'future', label: 'Future Bids', statuses: ['future'] },
  { id: 'ongoing', label: 'Ongoing Bids', statuses: ['ongoing'] },
  {
    id: 'previous',
    label: 'Previous Bids',
    statuses: ['completed', 'paid_shipping_pending', 'paid_held_in_escrow', 'closed', 'no_registrations', 'withdrawn', 'disapproved'],
  },
];

const Home = () => {
  const dispatch = useDispatch();
  const { auctions, isLoading } = useSelector((state) => state.auction);
  const { user } = useSelector((state) => state.auth);

  const [activePhase, setActivePhase] = useState('future');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    dispatch(getAllAuctions({ includeBids: false, includeRegistrations: true, force: true, limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    auctions.forEach((item) => item.category && set.add(item.category));
    return [...set];
  }, [auctions]);

  const phaseStatuses = PHASES.find((p) => p.id === activePhase)?.statuses || [];

  const filteredAuctions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return auctions.filter((auction) => {
      const byPhase = phaseStatuses.includes(auction.status);
      const byCategory = selectedCategory === 'All' || auction.category === selectedCategory;
      const byQuery =
        !query ||
        auction.title?.toLowerCase().includes(query) ||
        auction.description?.toLowerCase().includes(query);
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
      toast.error('Login required to register for bidding');
      return;
    }

    try {
      const { data } = await axios.post(
        `/auctions/${auctionId}/register`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success(`Registered successfully. Your number is #${data.registrationNumber}`);
      dispatch(getAllAuctions({ includeBids: false, includeRegistrations: true, force: true, limit: 200 }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <section className="rounded-3xl bg-gradient-to-r from-cyan-900 via-blue-900 to-emerald-700 text-white p-8 mb-8">
        <h1 className="text-4xl font-bold mb-2">RiZBiD Corporate Auction Network</h1>
        <p className="text-cyan-100 max-w-3xl">
          Sellers submit products for in-office verification. Approved items open for bidder registration, then move into organized live bidding.
        </p>
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 p-4 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bids by title or description"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {PHASES.map((phase) => {
            const Icon = phase.id === 'future' ? CalendarClock : phase.id === 'ongoing' ? Radio : History;
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  activePhase === phase.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={14} /> {phase.label}
              </button>
            );
          })}
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader className="animate-spin text-bid-purple" size={36} />
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-600">
          No listings found for this view.
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAuctions.map((auction) => (
            <AuctionCard
              key={auction._id}
              auction={auction}
              userId={user?._id}
              watched={watchlist.includes(auction._id)}
              onToggleWatch={toggleWatch}
              onRegister={registerForBid}
            />
          ))}
        </section>
      )}

      <section className="mt-12 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-gray-800 font-semibold">
          <MapPin size={16} /> RiZBiD Office Location
        </div>
        <iframe
          title="RiZBiD location"
          src="https://www.google.com/maps?q=Times+Square,+New+York,+NY&output=embed"
          className="w-full h-80"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      <p className="text-xs text-gray-500 mt-4">
        Platform commission: 5% from winning amount after successful completion.
      </p>
    </div>
  );
};

export default Home;
