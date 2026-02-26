import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-auto overflow-hidden bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="absolute -top-20 right-10 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute -bottom-24 left-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <img src="/BidPulse.svg" alt="BidPulse" className="h-9 w-auto" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">A trust-first auction network with email-verified participants, escrow payments, and real-time bidding intelligence.</p>
            <div className="inline-flex items-center gap-2 text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-300">
              <Sparkles size={12} /> Secure, verified, and live
            </div>
          </div>

          <div className="hidden md:block md:col-span-2"></div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-blue-300 transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-blue-300 transition-colors">How it Works</Link></li>
              <li><Link to="/safety" className="hover:text-blue-300 transition-colors">Safety & Trust</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/help" className="hover:text-blue-300 transition-colors">Help Center</Link></li>
              <li><Link to="/terms" className="hover:text-blue-300 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-300 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} BidPulse Inc. All rights reserved.</p>
          <p className="text-slate-400">Built for transparent digital commerce.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
