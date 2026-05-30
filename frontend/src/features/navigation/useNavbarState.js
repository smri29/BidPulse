import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { logout, reset } from '../../redux/authSlice';
import { NOTIFICATION_POPOVER_EVENT, readDismissedNotificationIds } from '../../utils/notificationPopover';
import { getModeFromPath, persistPreferredMode, readPreferredMode } from './navbarConfig';

export const useNavbarState = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: notifications, ownerKey } = useSelector((state) => state.notifications);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState(() => readDismissedNotificationIds(ownerKey));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter((item) => !item.read && !dismissedNotificationIds.includes(item.id)).length;
  const modeFromPath = getModeFromPath(location.pathname);
  const preferredMode = useMemo(() => readPreferredMode(), []);
  const activeMode = modeFromPath || preferredMode;
  const isSellerMode = activeMode === 'seller';
  const dashboardPath = isSellerMode ? '/dashboard/seller' : '/dashboard/bidder';

  useEffect(() => {
    if (modeFromPath) persistPreferredMode(modeFromPath);
  }, [modeFromPath]);

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsNotificationOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setDismissedNotificationIds(readDismissedNotificationIds(ownerKey));
    const handleDismissedChange = (event) => {
      if (event.detail?.ownerKey === ownerKey) {
        setDismissedNotificationIds(event.detail.ids || []);
      }
    };
    window.addEventListener(NOTIFICATION_POPOVER_EVENT, handleDismissedChange);
    return () => window.removeEventListener(NOTIFICATION_POPOVER_EVENT, handleDismissedChange);
  }, [ownerKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    setIsDropdownOpen(false);
    setIsNotificationOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleSwitchMode = () => {
    const nextMode = isSellerMode ? 'bidder' : 'seller';
    persistPreferredMode(nextMode);
    navigate(nextMode === 'seller' ? '/dashboard/seller' : '/dashboard/bidder');
  };

  return {
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
  };
};
