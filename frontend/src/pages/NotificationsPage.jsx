import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const NOTIFICATION_ICONS = {
  new_company: '🏢',
  deadline_near: '⏰',
  resume_done: '📊',
  new_experience: '💬',
  roadmap_updated: '🚀',
  general: '🔔'
};

const TYPE_LABELS = {
  new_company: 'New Company',
  deadline_near: 'Deadline',
  resume_done: 'Resume',
  new_experience: 'Experience',
  roadmap_updated: 'Roadmap',
  general: 'General'
};

const TYPE_COLORS = {
  new_company: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  deadline_near: 'bg-red-50 text-red-700 border-red-200',
  resume_done: 'bg-teal-50 text-teal-700 border-teal-200',
  new_experience: 'bg-purple-50 text-purple-700 border-purple-200',
  roadmap_updated: 'bg-green-50 text-green-700 border-green-200',
  general: 'bg-gray-50 text-gray-700 border-gray-200'
};

function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications', {
        params: { type: activeFilter, page }
      });
      setNotifications(res.data.notifications || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeFilter, page]);

  const handleMarkOne = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {}
  };

  const handleMarkAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filterButtons = [
    { value: '', label: 'All' },
    { value: 'new_company', label: '🏢 Company' },
    { value: 'deadline_near', label: '⏰ Deadline' },
    { value: 'resume_done', label: '📊 Resume' },
    { value: 'new_experience', label: '💬 Experience' },
    { value: 'roadmap_updated', label: '🚀 Roadmap' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-sm font-bold text-primary border border-primary/30 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition"
          >
            ✓ Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 custom-scrollbar">
        {filterButtons.map(f => (
          <button
            key={f.value}
            onClick={() => { setActiveFilter(f.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl font-semibold text-xs whitespace-nowrap transition-all border ${activeFilter === f.value ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-5xl mb-3">🔔</p>
          <h3 className="text-lg font-bold text-gray-800">No notifications yet</h3>
          <p className="text-sm text-gray-400 mt-1">You'll be notified when something important happens!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => !n.is_read && handleMarkOne(n.id)}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                  !n.is_read
                    ? 'bg-indigo-50/60 border-indigo-100 hover:bg-indigo-50 shadow-sm'
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                }`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border ${TYPE_COLORS[n.type] || TYPE_COLORS.general}`}>
                  {NOTIFICATION_ICONS[n.type] || '🔔'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-bold leading-snug ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {n.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[n.type] || TYPE_COLORS.general}`}>
                        {TYPE_LABELS[n.type] || 'General'}
                      </span>
                      {!n.is_read && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {n.message.replace(/\*\*/g, '')}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">{timeAgo(n.created_at)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
          >
            Previous
          </button>
          <span className="px-4 py-2 flex items-center text-sm text-gray-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
