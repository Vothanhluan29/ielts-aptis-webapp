import React, { useEffect } from 'react';
import { useNotification } from '../../../../contexts/NotificationContext';
import { Check, Info, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotification();
  const navigate = useNavigate();

  // Mark a notification as read
  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                <Bell size={24} />
              </div>
              Notifications
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}.
            </p>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center gap-2 shadow-sm text-sm"
                >
                  <Check size={16} />
                  Read All
                </button>
              )}
              <button 
                onClick={clearAllNotifications}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all flex items-center gap-2 shadow-sm text-sm"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                <Bell size={32} className="text-slate-300" />
              </div>
              <p className="text-lg font-medium">You're all caught up!</p>
              <p className="text-sm">No new notifications at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-5 hover:bg-slate-50 transition-colors flex gap-4 cursor-pointer relative ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${notif.type === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {notif.type === 'SUCCESS' ? <Check size={20} /> : <Info size={20} />}
                  </div>
                  
                  <div className="flex-1 pt-0.5">
                    <h4 className={`text-base font-bold ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </h4>
                    <p className="text-slate-600 mt-1 leading-relaxed text-sm md:text-base">
                      {notif.message}
                    </p>
                    <span className="text-sm text-slate-400 mt-2 block font-medium">
                      {new Date(notif.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  {!notif.is_read && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
