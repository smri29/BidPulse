import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CheckCircle, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { markAllNotificationsRead, markNotificationRead } from '../../redux/notificationSlice';
import {
  persistDismissedNotificationIds,
  readDismissedNotificationIds,
} from '../../utils/notificationPopover';

// This popover is only a compact preview. Dismissing here hides an item from
// the mini list without deleting it from the full notifications page.
const iconForType = (type) => {
  if (type === 'success') return <CheckCircle size={16} />;
  if (type === 'warning') return <AlertTriangle size={16} />;
  return <DollarSign size={16} />;
};

const toneForType = (type) => {
  if (type === 'success') return 'bg-green-100 text-green-600';
  if (type === 'warning') return 'bg-red-100 text-red-600';
  return 'bg-blue-100 text-blue-600';
};

const NotificationPopover = ({ onClose, variant = 'default' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: notifications, ownerKey } = useSelector((state) => state.notifications);
  const [dismissedIds, setDismissedIds] = useState(() => readDismissedNotificationIds(ownerKey));

  useEffect(() => {
    setDismissedIds(readDismissedNotificationIds(ownerKey));
  }, [ownerKey]);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const previewItems = useMemo(
    () =>
      [...notifications]
        .filter((item) => !dismissedIds.includes(item.id))
        .sort((a, b) => {
          // Keep unread items first, then sort newest to oldest within each group.
          if (a.read !== b.read) return a.read ? 1 : -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, 10),
    [dismissedIds, notifications]
  );
  const isAdmin = variant === 'admin';

  const panelClassName = isAdmin
    ? 'admin-dropdown absolute right-0 mt-2 w-80 rounded-2xl py-2 shadow-2xl'
    : 'premium-panel absolute right-0 mt-2 w-80 rounded-2xl py-2';

  const persistDismissed = (nextDismissedIds) => {
    setDismissedIds(nextDismissedIds);
    persistDismissedNotificationIds(ownerKey, nextDismissedIds);
  };

  const dismissFromPopover = (notificationId) => {
    if (dismissedIds.includes(notificationId)) return;
    // Preview dismissal is local state persistence, not a destructive delete.
    persistDismissed([...dismissedIds, notificationId]);
  };

  const handleSeeAll = () => {
    onClose?.();
    navigate('/notifications');
  };

  return (
    <div className={panelClassName}>
      <div className={`flex items-center justify-between border-b px-4 py-3 ${isAdmin ? 'border-white/10' : 'border-slate-100'}`}>
        <div>
          <p className={`text-sm font-bold ${isAdmin ? 'text-slate-100' : 'text-slate-800'}`}>Notifications</p>
          <p className={`text-xs ${isAdmin ? 'text-slate-400' : 'text-slate-500'}`}>
            {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'Everything is caught up'}
          </p>
        </div>
        <button
          onClick={handleSeeAll}
          className={`text-xs font-semibold ${isAdmin ? 'text-sky-300 hover:text-sky-200' : 'text-bid-purple hover:text-indigo-700'}`}
          type="button"
        >
          See All
        </button>
      </div>

      {previewItems.length > 0 ? (
        <>
          <div className={`px-4 pt-2 text-[11px] ${isAdmin ? 'text-slate-400' : 'text-slate-400'}`}>
            Swipe a notification sideways to hide it here.
          </div>

          <div className="max-h-96 overflow-y-auto py-1">
            <AnimatePresence initial={false}>
              {previewItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={(_, info) => {
                    // A clear sideways swipe acts like "hide from preview".
                    if (Math.abs(info.offset.x) > 90) {
                      dismissFromPopover(item.id);
                    }
                  }}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 140, height: 0, marginTop: 0, marginBottom: 0 }}
                  className="px-2"
                >
                  <button
                    onClick={() => dispatch(markNotificationRead(item.id))}
                    className={`flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition ${
                      isAdmin
                        ? `hover:bg-white/5 ${!item.read ? 'bg-white/[0.04]' : ''}`
                        : `hover:bg-slate-50 ${!item.read ? 'bg-indigo-50/30' : ''}`
                    }`}
                    type="button"
                  >
                    <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${toneForType(item.type)}`}>
                      {iconForType(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`truncate text-sm font-semibold ${isAdmin ? 'text-slate-100' : 'text-slate-800'}`}>{item.title}</p>
                        {!item.read && <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${isAdmin ? 'bg-sky-300' : 'bg-bid-purple'}`} />}
                      </div>
                      <p className={`mt-1 break-words text-xs ${isAdmin ? 'text-slate-300' : 'text-slate-600'}`}>{item.message}</p>
                      <p className={`mt-2 inline-flex items-center gap-1 text-[11px] ${isAdmin ? 'text-slate-400' : 'text-slate-400'}`}>
                        <Clock size={11} /> {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className={`border-t px-4 py-2 ${isAdmin ? 'border-white/10' : 'border-slate-100'}`}>
            <button
              onClick={() => dispatch(markAllNotificationsRead())}
              className={`text-xs font-medium ${isAdmin ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              type="button"
            >
              Mark all as read
            </button>
          </div>
        </>
      ) : (
        <div className="px-4 py-8 text-center">
          <Bell size={28} className={`mx-auto mb-3 ${isAdmin ? 'text-slate-500' : 'text-slate-300'}`} />
          <p className={`text-sm ${isAdmin ? 'text-slate-300' : 'text-slate-500'}`}>No notifications in this preview.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
