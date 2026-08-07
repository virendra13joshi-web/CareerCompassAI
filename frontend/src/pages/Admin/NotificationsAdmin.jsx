import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const TYPE_COLORS = {
  new_company: 'text-purple-400 bg-purple-400/10',
  deadline_near: 'text-amber-400 bg-amber-400/10',
  resume_done: 'text-emerald-400 bg-emerald-400/10',
  new_experience: 'text-cyan-400 bg-cyan-400/10',
  roadmap_updated: 'text-blue-400 bg-blue-400/10',
  general: 'text-slate-400 bg-slate-700',
};

const NotificationsAdmin = () => {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', type: 'general' });
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  const fetchNotifications = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/notifications?page=${p}`);
      setNotifications(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [page]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/admin/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      alert('Error deleting notification');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;
    setBroadcasting(true);
    try {
      await api.post('/admin/notifications/broadcast', broadcastForm);
      setBroadcastSuccess('Broadcast sent successfully to all students!');
      setBroadcastForm({ title: '', message: '', type: 'general' });
      fetchNotifications();
      setTimeout(() => setBroadcastSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400 text-sm mt-1">{total} notifications in the system</p>
      </motion.div>

      {/* Broadcast Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          Broadcast to All Students
        </h2>

        <AnimatePresence>
          {broadcastSuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-emerald-400/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">
              ✓ {broadcastSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-xs mb-1.5">Title *</label>
              <input type="text" required placeholder="e.g. New Company: Google is hiring!"
                value={broadcastForm.title}
                onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Type</label>
              <select value={broadcastForm.type}
                onChange={e => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                <option value="general">General</option>
                <option value="new_company">New Company</option>
                <option value="deadline_near">Deadline Near</option>
                <option value="resume_done">Resume Done</option>
                <option value="new_experience">New Experience</option>
                <option value="roadmap_updated">Roadmap Updated</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-1.5">Message *</label>
            <textarea required rows={3} placeholder="Write your notification message…"
              value={broadcastForm.message}
              onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={broadcasting}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 shadow-lg shadow-rose-900/30">
              {broadcasting && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Broadcast
            </button>
          </div>
        </form>
      </motion.div>

      {/* Notifications Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">All Notifications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Type</th>
                <th className="px-5 py-3 text-left font-medium">Title</th>
                <th className="px-5 py-3 text-left font-medium">Recipient</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="flex items-center justify-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Loading…
                  </div>
                </td></tr>
              ) : notifications.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-500">No notifications found.</td></tr>
              ) : notifications.map((n, i) => (
                <motion.tr key={n.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[n.type] || TYPE_COLORS.general}`}>
                      {n.type?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-white text-sm font-medium truncate max-w-[200px]">{n.title}</p>
                    <p className="text-slate-500 text-xs truncate max-w-[200px]">{n.message}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-sm">
                    {n.recipient_name || <span className="text-slate-600 italic">Broadcast</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${n.is_read ? 'text-slate-600 bg-slate-800' : 'text-indigo-400 bg-indigo-400/10'}`}>
                      {n.is_read ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(n.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(n.id)} disabled={deletingId === n.id}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      {deletingId === n.id
                        ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      }
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-slate-500 text-sm">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-sm text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NotificationsAdmin;
