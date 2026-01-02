import React from 'react';
import { Bell, CheckCircle, AlertTriangle, DollarSign, Clock } from 'lucide-react';

const Notifications = () => {
  // Mock Data (Since we don't have a database for this yet)
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Auction Won!',
      message: 'You won the "Vintage Camera" auction. Please proceed to payment.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'You have been outbid',
      message: 'Someone bid higher on "Gaming Laptop". Bid again now!',
      time: '5 hours ago',
      read: true,
    },
    {
      id: 3,
      type: 'info',
      title: 'Payment Received',
      message: 'Your payment for "Mechanical Keyboard" is held in Escrow.',
      time: '1 day ago',
      read: true,
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="text-bid-purple" /> Notifications
        </h1>
        <button className="text-sm text-bid-purple hover:text-indigo-700 font-medium">
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {notifications.map((item) => (
              <div 
                key={item.id} 
                className={`p-6 flex gap-4 hover:bg-slate-50 transition ${!item.read ? 'bg-indigo-50/30' : ''}`}
              >
                {/* Icon Logic */}
                <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                  ${item.type === 'success' ? 'bg-green-100 text-green-600' : 
                    item.type === 'warning' ? 'bg-red-100 text-red-600' : 
                    'bg-blue-100 text-blue-600'}`}>
                  {item.type === 'success' && <CheckCircle size={20} />}
                  {item.type === 'warning' && <AlertTriangle size={20} />}
                  {item.type === 'info' && <DollarSign size={20} />}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-bold ${!item.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {item.title}
                    </h3>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {item.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                </div>
              </div>
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