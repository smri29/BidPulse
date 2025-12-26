import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Section: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Column (Span 4) */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-500 transition">
                <Gavel className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition">
                BidPulse
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              The premium real-time auction marketplace. 
              Secure transactions, verified sellers, and exclusive finds.
            </p>
          </div>
          
          {/* Spacer Column */}
          <div className="hidden md:block md:col-span-2"></div>

          {/* Links Column 1 */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="hover:text-indigo-400 transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-indigo-400 transition-colors duration-200">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-indigo-400 transition-colors duration-200">
                  Safety & Trust
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/help" className="hover:text-indigo-400 transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-400 transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-indigo-400 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section: Copyright & Credits */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} BidPulse Inc. All rights reserved.</p>
          
          <div className="flex items-center gap-1.5">
            <span>Developed by</span>
            <span className="text-slate-300 font-medium hover:text-indigo-400 transition-colors cursor-default flex items-center gap-1">
              Shah Mohammad Rizvi <Heart size={10} className="text-red-500 fill-red-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;