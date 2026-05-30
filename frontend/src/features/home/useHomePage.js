/**
 * Module: features/home/useHomePage.js
 * Purpose: Contains the state, effects, and event handlers that drive the use Home Page flow.
 */
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import axios from '../../utils/axiosConfig';
import { getAllAuctions } from '../../redux/auctionSlice';
import { AUCTION_CATEGORY_OPTIONS } from '../../constants/auctionCategories';
import { HERO_MESSAGES, loadWatchlist, PHASES, WATCHLIST_KEY } from './homeConfig';

export const useHomePage = () => {
  const dispatch = useDispatch();
  const { auctions, isLoading } = useSelector((state) => state.auction);
  const { user } = useSelector((state) => state.auth);
  const [activePhase, setActivePhase] = useState('future');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [watchlist, setWatchlist] = useState(() => loadWatchlist());
  const [heroMessageIndex, setHeroMessageIndex] = useState(0);

  useEffect(() => {
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

  const categories = useMemo(() => {
    const set = new Set(['All', ...AUCTION_CATEGORY_OPTIONS]);
    auctions.forEach((item) => item.category && set.add(item.category));
    return [...set];
  }, [auctions]);

  const phaseStatuses = useMemo(
    () => PHASES.find((phase) => phase.id === activePhase)?.statuses || [],
    [activePhase]
  );

  const filteredAuctions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return auctions.filter((auction) => {
      const byPhase = phaseStatuses.includes(auction.status);
      const byCategory = selectedCategory === 'All' || auction.category === selectedCategory;
      const byQuery = !query || auction.title?.toLowerCase().includes(query) || auction.description?.toLowerCase().includes(query);
      return byPhase && byCategory && byQuery;
    });
  }, [auctions, phaseStatuses, search, selectedCategory]);

  const toggleWatch = (auctionId) => {
    setWatchlist((prev) => (prev.includes(auctionId) ? prev.filter((id) => id !== auctionId) : [...prev, auctionId]));
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
      dispatch(getAllAuctions({ includeBids: false, includeRegistrations: true, force: true, limit: 200 }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return {
    user,
    isLoading,
    activePhase,
    setActivePhase,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    watchlist,
    heroMessageIndex,
    categories,
    filteredAuctions,
    toggleWatch,
    registerForBid,
  };
};
