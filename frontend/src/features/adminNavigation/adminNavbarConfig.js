import { LayoutDashboard, MessageCircle, Package, Users } from 'lucide-react';

export const ADMIN_LINKS = [
  { to: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/auctions', label: 'Auctions', icon: Package },
  { to: '/admin/support', label: 'Support', icon: MessageCircle },
];
