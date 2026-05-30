/**
 * Module: components/Footer.jsx
 * Purpose: Supports the Footer module and keeps its responsibility isolated by file name.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles } from 'lucide-react';

// Footer acts as the closing brand/navigation surface for the public site.
const Footer = () => {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-28 left-6 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-700/70 bg-slate-900/78 p-7 shadow-[0_28px_60px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <img src="/AuctionPulse.png" alt="AuctionPulse" className="h-10 w-10 rounded-full object-cover" />
                <span className="text-xl font-extrabold text-white">AuctionPulse</span>
              </Link>

              <p className="max-w-md text-sm leading-relaxed text-slate-200">
                Premium, trust-first auctions with verified listings, transparent price movement, and managed fulfillment.
              </p>

              <div className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-100">
                <Sparkles size={13} /> Premium verified auction network
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/12 px-3 py-1 text-xs font-semibold text-cyan-200">
                <MapPin size={13} /> Dhanmondi, Dhaka, Bangladesh
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Platform</h3>
              <div className="grid gap-3 text-sm">
                <Link to="/" className="text-slate-200 hover:text-white">Live Auctions</Link>
                <Link to="/about" className="text-slate-200 hover:text-white">About Us</Link>
                <Link to="/how-it-works" className="text-slate-200 hover:text-white">How It Works</Link>
                <Link to="/safety" className="text-slate-200 hover:text-white">Safety & Trust</Link>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Support</h3>
              <div className="grid gap-3 text-sm">
                <Link to="/help" className="text-slate-200 hover:text-white">Help Center</Link>
                <Link to="/terms" className="text-slate-200 hover:text-white">Terms of Service</Link>
                <Link to="/privacy" className="text-slate-200 hover:text-white">Privacy Policy</Link>
              </div>
            </div>

            <div className="lg:col-span-3">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Get Started</h3>
              <p className="mb-4 text-sm text-slate-200">
                Join AuctionPulse to register for upcoming auctions and receive live auction notifications.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/register" className="btn-premium px-4 py-2 text-sm">Create Account</Link>
                <Link to="/login" className="btn-secondary px-4 py-2 text-sm">Sign In</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-400 md:flex-row">
          <p>&copy; {new Date().getFullYear()} AuctionPulse Inc. All rights reserved.</p>
          <p>Built for transparent, premium digital commerce.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
