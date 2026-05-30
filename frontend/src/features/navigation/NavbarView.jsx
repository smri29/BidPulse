import React from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { NAV_LINKS } from './navbarConfig';
import { useNavbarState } from './useNavbarState';
import DesktopNavLinks from './components/DesktopNavLinks';
import MobileNavMenu from './components/MobileNavMenu';
import NavbarAuthControls from './components/NavbarAuthControls';

const NavbarView = () => {
  const {
    location,
    user,
    unreadCount,
    isDropdownOpen,
    setIsDropdownOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    dropdownRef,
    notificationRef,
    isSellerMode,
    dashboardPath,
    onLogout,
    handleSwitchMode,
  } = useNavbarState();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/82 shadow-[0_18px_35px_-28px_rgba(9,24,56,0.95)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src="/AuctionPulse.png" alt="AuctionPulse" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-shimmer bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">AuctionPulse</span>
        </Link>

        <DesktopNavLinks links={NAV_LINKS} currentPath={location.pathname} />

        <div className="flex items-center gap-2 sm:gap-3">
          <NavbarAuthControls
            user={user}
            unreadCount={unreadCount}
            isNotificationOpen={isNotificationOpen}
            setIsNotificationOpen={setIsNotificationOpen}
            notificationRef={notificationRef}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            dropdownRef={dropdownRef}
            isSellerMode={isSellerMode}
            dashboardPath={dashboardPath}
            onLogout={onLogout}
            handleSwitchMode={handleSwitchMode}
          />

          <button onClick={() => setIsMobileMenuOpen((prev) => !prev)} className="inline-flex rounded-lg border border-slate-200 bg-white p-2 text-slate-600 lg:hidden" type="button" aria-label="Toggle navigation">
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <MobileNavMenu
        isMobileMenuOpen={isMobileMenuOpen}
        links={NAV_LINKS}
        currentPath={location.pathname}
        user={user}
        dashboardPath={dashboardPath}
        isSellerMode={isSellerMode}
        handleSwitchMode={handleSwitchMode}
        onLogout={onLogout}
      />
    </nav>
  );
};

export default NavbarView;
