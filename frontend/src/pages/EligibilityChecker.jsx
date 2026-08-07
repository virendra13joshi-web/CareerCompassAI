import React, { useState, useContext, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

// ─── Status Config ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'Eligible': {
    bg: 'bg-emerald-50', border: 'border-emerald-400',
    badge: 'bg-emerald-500', text: 'text-emerald-700',
    icon: '✅', headline: 'You\'re Eligible!',
    sub: 'You meet all the criteria for this role. Time to apply!'
  },
  'Partially Eligible': {
    bg: 'bg-amber-50', border: 'border-amber-400',
    badge: 'bg-amber-500', text: 'text-amber-700',
    icon: '⚡', headline: 'Partially Eligible',
    sub: 'You pass the academic requirements but need to improve some skills.'
  },
  'Not Eligible': {
    bg: 'bg-red-50', border: 'border-red-400',
    badge: 'bg-red-500', text: 'text-red-700',
    icon: '❌', headline: 'Not Eligible',
    sub: 'You currently don\'t meet some eligibility criteria. Here\'s how to improve.'
  }
};

// ─── Standalone Eligibility Checker Page ─────────────────────────────────────
const EligibilityChecker = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const prefilledCompanyId = location.state?.companyId || '';

  const [step, setStep] = useState('form'); // 'form' | 'loading' | 'result'
  const [companies, setCompanies] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    company_id: prefilledCompanyId,
    cgpa: '',
    branch: '',
    skills: '',
    backlogs: '0',
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies?limit=100');
        setCompanies(res.data.data || []);
      } catch (e) { /* silent */ }
    };
    fetchCompanies();

    // Pre-fill from profile
    if (user) {
      setForm(prev => ({
        ...prev,
        cgpa: user.cgpa || '',
        branch: user.branch || '',
        skills: user.skills || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStep('loading');
    try {
      const res = await api.post('/eligibility/check', {
        ...form,
        company_id: parseInt(form.company_id),
        cgpa: parseFloat(form.cgpa),
        backlogs: parseInt(form.backlogs),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      setResult(res.data);
      setStep('result');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      setStep('form');
    }
  };

  const resetForm = () => {
    setResult(null);
    setStep('form');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Smart Eligibility Checker
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Am I Eligible?
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Enter your academic details and instantly see if you qualify for a company — with an AI-powered learning roadmap.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Loading State ── */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl p-16 text-center"
            >
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-700">Analysing your profile...</h3>
              <p className="text-gray-400 mt-2">Comparing against eligibility criteria</p>
            </motion.div>
          )}

          {/* ── Form State ── */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary to-indigo-800 px-8 py-6">
                <h2 className="text-white text-xl font-bold">Your Academic Details</h2>
                <p className="text-indigo-200 text-sm mt-1">
                  {user ? 'Pre-filled from your profile — edit if needed.' : 'Fill in your details to check eligibility.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Company Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Company *
                  </label>
                  <select
                    name="company_id"
                    value={form.company_id}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 text-gray-800"
                  >
                    <option value="">-- Choose a company to check --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name} — {c.job_role}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* CGPA */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CGPA *</label>
                    <input
                      type="number" step="0.01" min="0" max="10"
                      name="cgpa" value={form.cgpa} onChange={handleChange} required
                      placeholder="e.g. 8.5"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50"
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Branch *</label>
                    <select
                      name="branch" value={form.branch} onChange={handleChange} required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50"
                    >
                      <option value="">-- Select branch --</option>
                      {['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'MCA', 'MBA', 'Other'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Backlogs */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Active Backlogs</label>
                    <input
                      type="number" min="0" max="20"
                      name="backlogs" value={form.backlogs} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Skills <span className="text-gray-400 font-normal">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    name="skills" value={form.skills} onChange={handleChange}
                    placeholder="e.g. React, Node.js, SQL, Java, Python"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50"
                  />
                  {form.skills && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.skills.split(',').map((s, i) => s.trim() && (
                        <span key={i} className="bg-indigo-50 text-primary text-xs font-medium px-3 py-1 rounded-full border border-indigo-100">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-primary to-indigo-700 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-primary transition-all shadow-lg hover:shadow-indigo-200 hover:shadow-xl"
                >
                  🔍 Check My Eligibility
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Results State ── */}
          {step === 'result' && result && (() => {
            const cfg = STATUS_CONFIG[result.status];
            return (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Status Banner */}
                <div className={`${cfg.bg} border-2 ${cfg.border} rounded-3xl p-8 text-center shadow-lg`}>
                  <div className="text-5xl mb-4">{cfg.icon}</div>
                  <span className={`inline-block ${cfg.badge} text-white text-sm font-bold px-4 py-1 rounded-full mb-3`}>
                    {result.status}
                  </span>
                  <h2 className={`text-3xl font-bold ${cfg.text} mb-2`}>{cfg.headline}</h2>
                  <p className="text-gray-600">{cfg.sub}</p>
                  <div className="mt-4 flex justify-center gap-3 text-sm font-medium text-gray-500">
                    <span>🏢 {result.company?.name}</span>
                    <span>·</span>
                    <span>💼 {result.company?.role}</span>
                  </div>
                </div>

                {/* Missing Criteria */}
                {result.missingCriteria?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <span className="text-red-500">⚠</span> Why You're Not Fully Eligible
                    </h3>
                    <div className="space-y-3">
                      {result.missingCriteria.map((c, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-500 font-bold text-sm">
                            {c.field.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{c.field}</h4>
                            <p className="text-sm text-gray-600 mt-0.5">{c.message}</p>
                            <div className="flex gap-4 mt-2 text-xs">
                              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                Yours: {c.provided}
                              </span>
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                Required: {c.required}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {result.missingSkills?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <span>🛠</span> Skills to Improve
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {result.missingSkills.map((skill, i) => (
                        <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-full text-sm font-semibold">
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Path / Recommendation */}
                {result.recommendation && (
                  <div className="bg-gradient-to-br from-indigo-900 via-primary to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="w-64 h-64 bg-white rounded-full absolute -top-20 -right-20 blur-3xl"></div>
                      <div className="w-48 h-48 bg-indigo-300 rounded-full absolute -bottom-10 -left-10 blur-2xl"></div>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Your Personalised Learning Roadmap
                      </h3>
                      <div className="text-indigo-100 text-sm leading-relaxed whitespace-pre-line">
                        {result.recommendation.split('\n').map((line, i) => {
                          if (line.startsWith('📘')) return <p key={i} className="text-white font-bold mt-4">{line}</p>;
                          if (line.match(/^\d+\./)) return <p key={i} className="ml-4 mt-1 text-indigo-100">{line}</p>;
                          return <p key={i} className="mt-1">{line}</p>;
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    ← Check Another Company
                  </button>
                  {result.status === 'Eligible' && (
                    <a
                      href={`/companies/${result.company?.id}`}
                      className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition text-center shadow-md"
                    >
                      Apply Now →
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EligibilityChecker;
