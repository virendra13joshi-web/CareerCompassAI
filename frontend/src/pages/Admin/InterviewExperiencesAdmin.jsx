import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const DIFF_COLORS = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-500/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-500/20',
};

const InterviewExperiencesAdmin = () => {
  const [experiences, setExperiences] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchExperiences = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, search });
      const res = await api.get(`/admin/experiences?${params}`);
      setExperiences(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); fetchExperiences(1); }, [search]);
  useEffect(() => { fetchExperiences(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this interview experience?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/experiences/${id}`);
      fetchExperiences();
    } catch (err) {
      alert('Error deleting experience');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Interview Experiences</h1>
        <p className="text-slate-400 text-sm mt-1">{total} experiences shared</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search by company, role, author…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Company & Role</th>
                <th className="px-5 py-3 text-left font-medium">Author</th>
                <th className="px-5 py-3 text-left font-medium">Difficulty</th>
                <th className="px-5 py-3 text-left font-medium">Likes</th>
                <th className="px-5 py-3 text-left font-medium">Comments</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12">
                  <div className="flex items-center justify-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Loading…
                  </div>
                </td></tr>
              ) : experiences.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-slate-500">No experiences found.</td></tr>
              ) : experiences.map((e, i) => (
                <motion.tr key={e.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{e.company_name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{e.company_name}</p>
                        <p className="text-slate-500 text-xs">{e.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-300 text-sm">{e.author_name || 'Anonymous'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${DIFF_COLORS[e.difficulty_level] || 'text-slate-400 bg-slate-700 border-slate-600'}`}>
                      {e.difficulty_level}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 text-rose-400 text-sm">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                      {e.likes_count ?? 0}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-sm">{e.comments_count ?? 0}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(e.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(e.id)} disabled={deletingId === e.id}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      {deletingId === e.id
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

export default InterviewExperiencesAdmin;
