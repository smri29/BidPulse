import React, { useMemo } from 'react';
import { Bell, CheckCircle, AlertTriangle, DollarSign, Clock, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { markAllNotificationsRead, markNotificationRead, clearNotifications } from '../redux/notificationSlice';

// Full notification history page.
// Unlike the navbar preview, this page shows the broader ordered feed and bulk actions.
const Notifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.items);
  const orderedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  const iconForType = (type) => {
    if (type === 'success') return <CheckCircle size={20} />;
    if (type === 'warning') return <AlertTriangle size={20} />;
    return <DollarSign size={20} />;
  };

  const toneForType = (type) => {
    if (type === 'success') return 'bg-green-100 text-green-600';
    if (type === 'warning') return 'bg-red-100 text-red-600';
    return 'bg-blue-100 text-blue-600';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="text-bid-purple" /> Notifications
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => dispatch(markAllNotificationsRead())} className="text-sm text-bid-purple hover:text-indigo-700 font-medium">Mark all as read</button>
          <button onClick={() => dispatch(clearNotifications())} className="text-sm text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1"><Trash2 size={14} /> Clear</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {orderedNotifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {orderedNotifications.map((item) => (
              <button
                key={item.id}
                onClick={() => dispatch(markNotificationRead(item.id))}
                className={`w-full text-left p-6 flex gap-4 hover:bg-slate-50 transition ${!item.read ? 'bg-indigo-50/30' : ''}`}
              >
                <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${toneForType(item.type)}`}>
                  {iconForType(item.type)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-bold ${!item.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {item.title}
                    </h3>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-200" />
            <p>No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
