import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// ─── Score Ring Component ─────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 180 }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981'; // emerald
    if (s >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getLabel = (s) => {
    if (s >= 90) return 'Excellent';
    if (s >= 75) return 'Good';
    if (s >= 60) return 'Average';
    if (s >= 40) return 'Poor';
    return 'Very Poor';
  };

  const color = getColor(animatedScore);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease-in-out, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black" style={{ color }}>{animatedScore}</span>
        <span className="text-sm text-gray-500 font-semibold">/100</span>
        <span className="text-xs font-bold mt-0.5" style={{ color }}>{getLabel(animatedScore)}</span>
      </div>
    </div>
  );
};

// ─── Section Score Bar ────────────────────────────────────────────────────────
const SectionBar = ({ label, score }) => {
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(score), 400); return () => clearTimeout(t); }, [score]);

  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700 capitalize">{label.replace(/_/g, ' ')}</span>
        <span className="font-bold text-gray-900">{score}/100</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${animated}%` }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ResumeAnalyzer = () => {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState('upload'); // upload | analyzing | result
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('result'); // result | history
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const reportRef = useRef(null);

  // Auth state for inline login
  const { login } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      login(res.data.token, res.data.user);
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Fetch history ──────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get('/resume/history');
      setHistory(res.data);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please drop a valid PDF file.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setError(''); }
  };

  // ── Submit for analysis ────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!selectedFile) return setError('Please select a PDF resume first.');
    setError('');
    setStep('analyzing');
    setUploadProgress(0);

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setUploadProgress(p => (p < 85 ? p + Math.random() * 8 : p));
    }, 400);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const res = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setReport(res.data);
        setStep('result');
        setActiveTab('result');
        fetchHistory();
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
      setStep('upload');
    }
  };

  // ── Load a historical report ───────────────────────────────────────────────
  const loadReport = async (id) => {
    try {
      const res = await api.get(`/resume/${id}`);
      setReport(res.data);
      setStep('result');
      setActiveTab('result');
    } catch (_) {}
  };

  // ── Print / Download Report ────────────────────────────────────────────────
  const handleDownload = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 py-10 px-4 print:bg-white print:py-0">
      {/* Print styles injected inline */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-full { max-width: 100% !important; }
          body { font-size: 12px; }
        }
      `}</style>

      {!user ? (
        <div className="max-w-md mx-auto mt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
            <div className="text-5xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-8">Please login to analyze your resume.</p>
            
            {!showLogin ? (
              <button 
                onClick={() => setShowLogin(true)}
                className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md"
              >
                Login
              </button>
            ) : (
              <form onSubmit={handleInlineLogin} className="space-y-4 text-left">
                {loginError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                    {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    required 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Enter your password"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loginLoading}
                  className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
                >
                  {loginLoading ? 'Logging in...' : 'Sign In'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowLogin(false)}
                  className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Cancel
                </button>
              </form>
            )}
          </motion.div>
        </div>
      ) : (
      <div className="max-w-5xl mx-auto print-full">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 no-print">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
            AI-Powered Resume Analyzer
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Resume <span className="text-primary">ATS Analyzer</span></h1>
          <p className="text-gray-500 max-w-lg mx-auto">Upload your PDF resume and get a detailed ATS compatibility score, strengths, weaknesses, and an actionable improvement plan — powered by GPT-4o.</p>
        </motion.div>

        {/* ── Tabs (when history exists) ── */}
        {history.length > 0 && step !== 'analyzing' && (
          <div className="flex gap-2 mb-6 no-print">
            {['result', 'history'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all capitalize ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {tab === 'result' ? (step === 'result' ? 'Current Report' : 'New Analysis') : `History (${history.length})`}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════ HISTORY TAB ═══════════════════════ */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-indigo-800 px-8 py-6 text-white">
                  <h2 className="text-xl font-bold">Analysis History</h2>
                  <p className="text-indigo-200 text-sm mt-1">Click any report to view the full analysis.</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {history.map((h, i) => (
                    <div key={h.id} onClick={() => loadReport(h.id)}
                      className="flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${h.ats_score >= 75 ? 'bg-emerald-500' : h.ats_score >= 55 ? 'bg-amber-500' : 'bg-red-500'}`}>
                          {h.ats_score}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{h.resume_filename?.replace('resume-', '').replace(/-.{16}\./, '.')}</p>
                          <p className="text-sm text-gray-500">{new Date(h.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════ UPLOAD ═══════════════════════════ */}
          {activeTab === 'result' && step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                  className={`m-8 border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer ${dragOver ? 'border-primary bg-indigo-50 scale-[1.01]' : selectedFile ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-indigo-50'}`}
                >
                  <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                  {selectedFile ? (
                    <div>
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-emerald-700">PDF Ready</h3>
                      <p className="text-emerald-600 mt-2 font-medium">{selectedFile.name}</p>
                      <p className="text-gray-500 text-sm mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); fileInputRef.current.value = ''; }}
                        className="mt-4 text-sm text-gray-400 hover:text-red-500 underline">Remove file</button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Drop your resume here</h3>
                      <p className="text-gray-500 mt-2">or click to browse files</p>
                      <p className="text-xs text-gray-400 mt-4 bg-gray-100 inline-block px-3 py-1 rounded-full">PDF only · Max 5MB</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mx-8 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm">{error}</div>
                )}

                <div className="p-8 pt-0">
                  <button onClick={handleAnalyze} disabled={!selectedFile}
                    className="w-full py-4 bg-gradient-to-r from-primary to-indigo-700 text-white font-bold text-lg rounded-2xl hover:from-indigo-700 hover:to-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-200 hover:shadow-xl">
                    🤖 Analyze with AI
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3">Analysis typically takes 10–20 seconds</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════ ANALYZING ════════════════════════ */}
          {step === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-3 border-4 border-indigo-300/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">AI Analyzing Your Resume</h3>
              <p className="text-gray-500 mb-8">GPT-4o is reviewing your resume for ATS compatibility, skills, formatting, and more...</p>
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Analyzing</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-4">
                  {['Extracting text', 'ATS analysis', 'Scoring', 'Generating report'].map((label, i) => (
                    <span key={i} className={uploadProgress > i * 25 ? 'text-primary font-semibold' : ''}>{label}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════ RESULT ═══════════════════════════ */}
          {activeTab === 'result' && step === 'result' && report && (
            <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              ref={reportRef} className="space-y-6">

              {/* ── Action Bar ── */}
              <div className="flex justify-between items-center no-print">
                <button onClick={() => { setStep('upload'); setSelectedFile(null); setReport(null); }}
                  className="px-5 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  New Analysis
                </button>
                <button onClick={handleDownload}
                  className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition flex items-center gap-2 shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Report
                </button>
              </div>

              {/* ── Score + Summary Hero ── */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="flex justify-center relative" style={{ height: 180 }}>
                    <ScoreRing score={report.ats_score} size={180} />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${report.ats_score >= 75 ? 'bg-emerald-500' : report.ats_score >= 55 ? 'bg-amber-500' : 'bg-red-500'}`}>
                        ATS Score: {report.ats_score}/100
                      </span>
                      <span className="text-xs text-gray-400">{report.resume_filename}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Analysis Summary</h2>
                    <p className="text-gray-600 leading-relaxed">{report.summary}</p>
                  </div>
                </div>
              </div>

              {/* ── Section Scores ── */}
              {report.section_scores && Object.keys(report.section_scores).length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="text-2xl">📊</span> Section-wise Scores
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(report.section_scores).map(([key, val]) => (
                      <SectionBar key={key} label={key} score={Number(val)} />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── Strengths ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">💪</span> Strengths
                  </h3>
                  <ul className="space-y-3">
                    {(report.strengths || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-gray-700 text-sm">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ── Weaknesses ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span> Weaknesses
                  </h3>
                  <ul className="space-y-3">
                    {(report.weaknesses || []).map((w, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                        <span className="text-gray-700 text-sm">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── Missing Keywords ── */}
              {report.missing_keywords?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔑</span> Missing ATS Keywords
                    <span className="text-sm font-normal text-gray-500 ml-2">— Add these to improve your score</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {report.missing_keywords.map((kw, i) => (
                      <span key={i} className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                        <span className="text-red-400 font-bold">+</span> {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Formatting Issues ── */}
              {report.formatting_issues?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📐</span> Formatting Issues
                  </h3>
                  <ul className="space-y-2">
                    {report.formatting_issues.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-amber-800">
                        <span className="font-bold text-amber-500 mt-0.5">{i + 1}.</span>
                        <span className="text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── AI Suggestions ── */}
              {report.suggestions?.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-900 to-primary rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-64 h-64 bg-white rounded-full absolute -top-20 -right-20 blur-3xl" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      AI Improvement Suggestions
                    </h3>
                    <div className="space-y-4">
                      {report.suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
                          <p className="text-indigo-100 text-sm leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Analyzed At ── */}
              <p className="text-center text-xs text-gray-400">
                Analyzed on {new Date(report.analyzed_at || report.created_at).toLocaleString()}
              </p>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
