import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCompanies = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, search });
      const res = await api.get(`/admin/companies?${params}`);
      setCompanies(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); fetchCompanies(1); }, [search]);
  useEffect(() => { fetchCompanies(); }, [page]);

  const openModal = (company = null) => {
    if (company) {
      setEditingId(company.id);
      setFormData({
        ...company,
        allowed_branches: Array.isArray(company.allowed_branches) ? company.allowed_branches.join(', ') : company.allowed_branches || '',
        required_skills: Array.isArray(company.required_skills) ? company.required_skills.join(', ') : company.required_skills || '',
        application_deadline: company.application_deadline ? new Date(company.application_deadline).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingId(null);
      setFormData({});
    }
    setLogoFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && key !== 'logo_url') {
        let val = formData[key];
        if (key === 'allowed_branches' || key === 'required_skills') {
          val = JSON.stringify(val.split(',').map(s => s.trim()).filter(s => s));
        }
        data.append(key, val);
      }
    });
    if (logoFile) data.append('logo', logoFile);
    try {
      if (editingId) {
        await api.put(`/admin/companies/${editingId}`, data);
      } else {
        await api.post('/admin/companies', data);
      }
      setShowModal(false);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/companies/${id}`);
      fetchCompanies();
    } catch (err) {
      alert('Error deleting company');
    }
  };

  const Field = ({ label, name, type = 'text', placeholder, required, step }) => (
    <div>
      <label className="block text-slate-400 text-xs mb-1.5">{label}{required && ' *'}</label>
      <input
        type={type}
        name={name}
        step={step}
        required={required}
        placeholder={placeholder}
        value={formData[name] || ''}
        onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
        className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Company Management</h1>
          <p className="text-slate-400 text-sm mt-1">{total} companies listed</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-900/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Company
        </button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search companies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
        />
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Company</th>
                <th className="px-5 py-3 text-left font-medium">Role</th>
                <th className="px-5 py-3 text-left font-medium">Package</th>
                <th className="px-5 py-3 text-left font-medium">Min CGPA</th>
                <th className="px-5 py-3 text-left font-medium">Deadline</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="flex items-center justify-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Loading companies…
                  </div>
                </td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-500">No companies found. Add one above.</td></tr>
              ) : companies.map((c, i) => (
                <motion.tr key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {c.logo_url
                        ? <img src={`http://localhost:5000${c.logo_url}`} className="w-9 h-9 rounded-lg object-cover border border-slate-700" alt="logo" />
                        : <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{c.company_name?.charAt(0)}</span>
                          </div>
                      }
                      <div>
                        <p className="text-white text-sm font-medium">{c.company_name}</p>
                        <p className="text-slate-500 text-xs">{c.location || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-300 text-sm">{c.job_role}</td>
                  <td className="px-5 py-3">
                    <span className="text-emerald-400 text-sm font-medium">{c.package || '—'}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-sm">{c.min_cgpa ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-400 text-sm">
                    {c.application_deadline ? new Date(c.application_deadline).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(c)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">{editingId ? 'Edit Company' : 'Add New Company'}</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Company Name" name="company_name" required placeholder="e.g. Google" />
                  <Field label="Job Role" name="job_role" required placeholder="e.g. Software Engineer" />
                  <Field label="Package (e.g. 15 LPA)" name="package" placeholder="15 LPA" />
                  <Field label="Location" name="location" placeholder="Bangalore, Remote…" />
                  <Field label="Min CGPA" name="min_cgpa" type="number" step="0.1" placeholder="7.5" />
                  <Field label="Interview Rounds" name="interview_rounds" type="number" placeholder="3" />
                  <Field label="Application Deadline" name="application_deadline" type="date" />
                  <Field label="Official Website" name="official_website" type="url" placeholder="https://careers.google.com" />
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">Allowed Branches (comma-separated)</label>
                    <input type="text" name="allowed_branches" placeholder="CSE, IT, ECE"
                      value={formData.allowed_branches || ''}
                      onChange={e => setFormData({ ...formData, allowed_branches: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">Required Skills (comma-separated)</label>
                    <input type="text" name="required_skills" placeholder="React, Node, SQL"
                      value={formData.required_skills || ''}
                      onChange={e => setFormData({ ...formData, required_skills: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-xs mb-1.5">Hiring Process</label>
                    <textarea name="hiring_process" rows={3} placeholder="Online test → Technical round → HR…"
                      value={formData.hiring_process || ''}
                      onChange={e => setFormData({ ...formData, hiring_process: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-xs mb-1.5">Previous Year Questions</label>
                    <textarea name="previous_questions" rows={3} placeholder="Write sample questions here…"
                      value={formData.previous_questions || ''}
                      onChange={e => setFormData({ ...formData, previous_questions: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">Company Logo</label>
                    <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])}
                      className="w-full text-slate-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 transition-colors" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60">
                    {saving && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    {editingId ? 'Update' : 'Save'} Company
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyManagement;
