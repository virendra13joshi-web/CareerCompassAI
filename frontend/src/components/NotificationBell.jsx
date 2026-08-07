import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const NOTIFICATION_ICONS = {
  new_company: '🏢',
  deadline_near: '⏰',
  resume_done: '📊',
  new_experience: '💬',
  roadmap_updated: '🚀',
  general: '🔔'
};

function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now - past) / 1000); // seconds

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      // Silent fail — user might be logged out
    }
  };

  // Fetch recent notifications for dropdown preview (latest 8)
  const fetchPreview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=8');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Poll for unread count every 60 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setOpen(!open);
    if (!open) fetchPreview();
  };

  const handleMarkOne = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {}
  };

  const handleMarkAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-primary"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
              <span className="text-xs bg-indigo-100 text-primary font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm font-medium">You're all caught up!</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkOne(n.id)}
                  className={`flex items-start gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-indigo-50/60 hover:bg-indigo-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="text-2xl flex-shrink-0 mt-0.5">
                    {NOTIFICATION_ICONS[n.type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold leading-snug ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {n.message.replace(/\*\*/g, '')}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-primary hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
