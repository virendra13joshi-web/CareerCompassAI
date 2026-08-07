import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const RoadmapsAdmin = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRoadmaps = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/roadmaps?page=${p}`);
      setRoadmaps(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoadmaps(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this roadmap?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/roadmaps/${id}`);
      fetchRoadmaps();
    } catch (err) {
      alert('Error deleting roadmap');
    } finally {
      setDeletingId(null);
    }
  };

  const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Roadmaps</h1>
        <p className="text-slate-400 text-sm mt-1">{total} roadmaps generated</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Student</th>
                <th className="px-5 py-3 text-left font-medium">Dream Company</th>
                <th className="px-5 py-3 text-left font-medium">Target Date</th>
                <th className="px-5 py-3 text-left font-medium">Days Left</th>
                <th className="px-5 py-3 text-left font-medium">Created</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="flex items-center justify-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Loading roadmaps…
                  </div>
                </td></tr>
              ) : roadmaps.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-500">No roadmaps found.</td></tr>
              ) : roadmaps.map((r, i) => {
                const days = daysUntil(r.target_date);
                return (
                  <motion.tr key={r.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-white text-sm font-medium">{r.student_name || 'Unknown'}</p>
                      <p className="text-slate-500 text-xs">{r.student_email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{r.dream_company?.charAt(0)}</span>
                        </div>
                        <span className="text-slate-200 text-sm font-medium">{r.dream_company}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-sm">
                      {r.target_date ? new Date(r.target_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {days != null ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          days < 0 ? 'text-slate-500 bg-slate-700' :
                          days < 30 ? 'text-red-400 bg-red-400/10' :
                          days < 90 ? 'text-amber-400 bg-amber-400/10' :
                          'text-emerald-400 bg-emerald-400/10'
                        }`}>
                          {days < 0 ? 'Expired' : `${days}d`}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        {deletingId === r.id
                          ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        }
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
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

export default RoadmapsAdmin;
