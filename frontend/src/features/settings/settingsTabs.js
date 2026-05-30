/**
 * Module: features/settings/settingsTabs.js
 * Purpose: Stores static configuration values used by the surrounding feature modules.
 */
import { Bell, Lock, Trash2 } from 'lucide-react';

export const SETTINGS_TABS = [
  { id: 'security', label: 'Login & Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'danger', label: 'Delete Account', icon: Trash2 },
];
