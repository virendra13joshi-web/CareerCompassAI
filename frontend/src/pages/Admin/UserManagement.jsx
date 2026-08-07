import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const UserManagement = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [changingRoleId, setChangingRoleId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchStudents = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, search, role: roleFilter });
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

  useEffect(() => { setPage(1); setSelected(new Set()); fetchStudents(1); }, [search, roleFilter]);
  useEffect(() => { fetchStudents(); }, [page]);

  const handleRoleChange = async (id, newRole) => {
    setChangingRoleId(id);
    try {
      await api.patch(`/admin/students/${id}/role`, { role: newRole });
      showToast(`User ${newRole === 'admin' ? 'promoted to Admin' : 'demoted to Student'} successfully.`);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating role');
    } finally {
      setChangingRoleId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/students/${id}`);
      showToast('User deleted.');
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === students.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(students.map(s => s.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return;
    if (bulkAction === 'delete' && !window.confirm(`Delete ${selected.size} users? This cannot be undone.`)) return;
    setBulkProcessing(true);
    try {
      for (const id of selected) {
        if (bulkAction === 'delete') {
          await api.delete(`/admin/students/${id}`).catch(() => {});
        } else {
          await api.patch(`/admin/students/${id}/role`, { role: bulkAction }).catch(() => {});
        }
      }
      showToast(`Bulk action applied to ${selected.size} users.`);
      setSelected(new Set());
      setBulkAction('');
      fetchStudents();
    } finally {
      setBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 text-sm mt-1">{total} users · manage roles and accounts</p>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl">
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters + Bulk */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by name or email…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">{selected.size} selected</span>
            <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Bulk Action…</option>
              <option value="admin">Promote to Admin</option>
              <option value="student">Demote to Student</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button onClick={handleBulkAction} disabled={!bulkAction || bulkProcessing}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 py-2 rounded-xl disabled:opacity-50 transition-colors">
              {bulkProcessing && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              Apply
            </button>
          </div>
        )}
      </motion.div>

      {/* Role Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-4">
        {[
          { label: 'Students', filter: 'student', color: 'border-slate-700 text-slate-300', badge: 'bg-slate-700 text-slate-300' },
          { label: 'Admins', filter: 'admin', color: 'border-indigo-500/30 text-indigo-300', badge: 'bg-indigo-500/20 text-indigo-300' },
        ].map(item => (
          <button key={item.label}
            onClick={() => setRoleFilter(roleFilter === item.filter ? '' : item.filter)}
            className={`bg-slate-900 border rounded-xl p-4 text-left transition-all ${item.color} ${roleFilter === item.filter ? 'ring-1 ring-indigo-500' : 'hover:border-slate-600'}`}>
            <p className="text-slate-400 text-xs">{item.label}</p>
            <p className="text-2xl font-bold mt-0.5">{
              students.filter(s => s.role === item.filter).length + (roleFilter && roleFilter !== item.filter ? 0 : 0)
            }</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.badge}`}>{item.filter}</span>
          </button>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium w-10">
                  <input type="checkbox"
                    checked={students.length > 0 && selected.size === students.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
                </th>
                <th className="px-5 py-3 text-left font-medium">User</th>
                <th className="px-5 py-3 text-left font-medium">College / Branch</th>
                <th className="px-5 py-3 text-left font-medium">Current Role</th>
                <th className="px-5 py-3 text-left font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="flex items-center justify-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Loading users…
                  </div>
                </td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-500">No users found.</td></tr>
              ) : students.map((s, i) => (
                <motion.tr key={s.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className={`transition-colors ${selected.has(s.id) ? 'bg-indigo-500/5' : 'hover:bg-slate-800/40'}`}>
                  <td className="px-5 py-3">
                    <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)}
                      className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.role === 'admin' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-slate-700'}`}>
                        <span className="text-white text-sm font-bold">{s.full_name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{s.full_name}</p>
                        <p className="text-slate-500 text-xs">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-slate-400 text-sm">{s.college || '—'}</p>
                    <p className="text-slate-600 text-xs">{s.branch || '—'}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                      s.role === 'admin'
                        ? 'text-indigo-400 bg-indigo-400/10 border-indigo-500/30'
                        : 'text-slate-400 bg-slate-700/50 border-slate-600/20'
                    }`}>
                      {s.role === 'admin' ? '⚡ Admin' : '👤 Student'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Role Toggle */}
                      <button
                        onClick={() => handleRoleChange(s.id, s.role === 'admin' ? 'student' : 'admin')}
                        disabled={changingRoleId === s.id}
                        title={s.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                          s.role === 'admin'
                            ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                            : 'text-indigo-400 bg-indigo-400/10 hover:bg-indigo-400/20'
                        }`}>
                        {changingRoleId === s.id
                          ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          : s.role === 'admin' ? '↓ Demote' : '↑ Promote'
                        }
                      </button>
                      {/* Delete */}
                      <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
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

export default UserManagement;
