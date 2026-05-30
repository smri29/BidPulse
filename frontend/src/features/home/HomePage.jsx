/**
 * Module: features/home/HomePage.jsx
 * Purpose: Renders the Home Page screen by composing smaller feature-specific sections.
 */
import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CalendarClock, History, Loader, MapPin, Radio, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import AuctionCard from '../../components/cards/AuctionCard';
import Reveal from '../../components/ui/Reveal';
import { HERO_MESSAGES, PHASES } from './homeConfig';
import InteractivePulseVisual from './components/InteractivePulseVisual';
import { useHomePage } from './useHomePage';

const HomePage = () => {
  const {
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
  } = useHomePage();

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
                <Link to="/how-it-works" className="btn-premium px-4 py-2 text-sm">Explore Process <ArrowRight size={15} /></Link>
                <Link to="/safety" className="btn-soft px-4 py-2 text-sm text-slate-700">Trust & Safety</Link>
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
              <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search auctions by title or description" className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-9 pr-3" />
            </div>
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5">
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {PHASES.map((phase) => {
              const Icon = phase.id === 'future' ? CalendarClock : phase.id === 'ongoing' ? Radio : History;
              return (
                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} key={phase.id} onClick={() => setActivePhase(phase.id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${activePhase === phase.id ? 'btn-secondary text-white' : 'btn-soft text-slate-700'}`} type="button">
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
            <h2 className="text-xl font-bold text-slate-900">{PHASES.find((phase) => phase.id === activePhase)?.label}</h2>
            <p className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600">{filteredAuctions.length} listings</p>
          </div>

          {isLoading ? (
            <div className="surface-card flex h-52 items-center justify-center rounded-2xl"><Loader className="animate-spin text-bid-purple" size={36} /></div>
          ) : filteredAuctions.length === 0 ? (
            <div className="surface-card rounded-2xl border-dashed p-10 text-center text-slate-600">No listings found for this view.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAuctions.map((auction, index) => (
                <Reveal key={auction._id} delay={index * 35} y={14}>
                  <AuctionCard auction={auction} userId={user?._id} watched={watchlist.includes(auction._id)} onToggleWatch={toggleWatch} onRegister={registerForBid} />
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
          <iframe title="AuctionPulse location in Dhanmondi, Dhaka, Bangladesh" src="https://www.google.com/maps?q=Dhanmondi,+Dhaka,+Bangladesh&output=embed" className="h-80 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </section>
      </Reveal>

      <p className="mt-4 text-xs text-slate-500">Platform commission: 5% from the final sale amount after successful completion.</p>
    </div>
  );
};

export default HomePage;
