import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const scoreColor = (score) => {
  if (score >= 80) return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
  if (score >= 60) return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
  if (score >= 40) return 'text-orange-400 bg-orange-400/10 border-orange-500/20';
  return 'text-red-400 bg-red-400/10 border-red-500/20';
};

const ResumeReports = () => {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewReport, setViewReport] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchReports = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, search });
      const res = await api.get(`/admin/reports?${params}`);
      setReports(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); fetchReports(1); }, [search]);
  useEffect(() => { fetchReports(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume report?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/reports/${id}`);
      fetchReports();
    } catch (err) {
      alert('Error deleting report');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Resume Reports</h1>
        <p className="text-slate-400 text-sm mt-1">{total} reports generated</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search by student or filename…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Student</th>
                <th className="px-5 py-3 text-left font-medium">File</th>
                <th className="px-5 py-3 text-left font-medium">ATS Score</th>
                <th className="px-5 py-3 text-left font-medium">Summary</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="flex items-center justify-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Loading reports…
                  </div>
                </td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-500">No reports found.</td></tr>
              ) : reports.map((r, i) => (
                <motion.tr key={r.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-white text-sm font-medium">{r.student_name || 'Unknown'}</p>
                    <p className="text-slate-500 text-xs">{r.student_email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-slate-300 text-sm font-mono truncate max-w-[180px]">{r.resume_filename || '—'}</p>
                  </td>
                  <td className="px-5 py-3">
                    {r.ats_score != null ? (
                      <span className={`text-sm font-bold px-3 py-1 rounded-full border ${scoreColor(r.ats_score)}`}>
                        {r.ats_score}/100
                      </span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-sm max-w-[200px] truncate">
                    {r.summary || '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewReport(r)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors" title="View">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                        {deletingId === r.id
                          ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        }
                      </button>
                    </div>
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

      {/* Detail Modal */}
      <AnimatePresence>
        {viewReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setViewReport(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-xl shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-white font-bold text-lg">{viewReport.student_name}'s Resume Report</h2>
                  <p className="text-slate-400 text-sm">{viewReport.resume_filename}</p>
                </div>
                <button onClick={() => setViewReport(null)} className="text-slate-500 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {viewReport.ats_score != null && (
                <div className="flex items-center gap-4 mb-5 p-4 bg-slate-800 rounded-xl">
                  <div className={`text-4xl font-black ${viewReport.ats_score >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {viewReport.ats_score}
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">ATS Score</p>
                    <div className="w-48 h-2 bg-slate-700 rounded-full mt-1">
                      <div className={`h-2 rounded-full ${viewReport.ats_score >= 80 ? 'bg-emerald-400' : viewReport.ats_score >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${viewReport.ats_score}%` }} />
                    </div>
                  </div>
                </div>
              )}
              {viewReport.summary && (
                <div className="mb-4">
                  <p className="text-slate-500 text-xs mb-1">Summary</p>
                  <p className="text-slate-200 text-sm leading-relaxed">{viewReport.summary}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeReports;
