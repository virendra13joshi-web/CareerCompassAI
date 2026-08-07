import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const ROLE_COLORS = {
  admin: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/20',
  student: 'text-slate-400 bg-slate-700/50 border-slate-600/20',
};

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewStudent, setViewStudent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [changingRoleId, setChangingRoleId] = useState(null);

  const fetchStudents = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, search, branch: branchFilter, role: roleFilter });
      const res = await api.get(`/admin/students?${params}`);
      setStudents(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); fetchStudents(1); }, [search, branchFilter, roleFilter]);
  useEffect(() => { fetchStudents(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting student');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    setChangingRoleId(id);
    try {
      await api.patch(`/admin/students/${id}/role`, { role: newRole });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating role');
    } finally {
      setChangingRoleId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Student Management</h1>
        <p className="text-slate-400 text-sm mt-1">{total} students registered</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, college…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
          <option value="">All Branches</option>
          {['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'AIDS', 'AIML', 'DS'].map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Student</th>
                <th className="px-5 py-3 text-left font-medium">Branch</th>
                <th className="px-5 py-3 text-left font-medium">CGPA</th>
                <th className="px-5 py-3 text-left font-medium">Role</th>
                <th className="px-5 py-3 text-left font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="flex items-center justify-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Loading students…
                  </div>
                </td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-500">No students found.</td></tr>
              ) : students.map((s, i) => (
                <motion.tr key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">{s.full_name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{s.full_name}</p>
                        <p className="text-slate-500 text-xs">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-sm">{s.branch || '—'}</td>
                  <td className="px-5 py-3 text-slate-300 text-sm font-mono">{s.cgpa ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${ROLE_COLORS[s.role] || ROLE_COLORS.student}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewStudent(s)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button
                        onClick={() => handleRoleChange(s.id, s.role === 'admin' ? 'student' : 'admin')}
                        disabled={changingRoleId === s.id}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                        title={s.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                      >
                        {changingRoleId === s.id
                          ? <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        }
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        {deletingId === s.id
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-slate-500 text-sm">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-sm text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">Next →</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {viewStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setViewStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{viewStudent.full_name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">{viewStudent.full_name}</h2>
                    <p className="text-slate-400 text-sm">{viewStudent.email}</p>
                  </div>
                </div>
                <button onClick={() => setViewStudent(null)} className="text-slate-500 hover:text-white p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['College', viewStudent.college], ['Branch', viewStudent.branch],
                  ['Semester', viewStudent.semester], ['CGPA', viewStudent.cgpa],
                  ['Phone', viewStudent.phone_number || viewStudent.phone], ['Role', viewStudent.role],
                  ['LinkedIn', viewStudent.linkedin], ['GitHub', viewStudent.github],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-slate-500 text-xs mb-0.5">{label}</p>
                    <p className="text-slate-200">{val || '—'}</p>
                  </div>
                ))}
              </div>
              {viewStudent.skills && (
                <div className="mt-4">
                  <p className="text-slate-500 text-xs mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewStudent.skills.split(',').map(s => (
                      <span key={s} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-lg">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentManagement;
