import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const PreparationRoadmap = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | dsa | sql_dbms | oop | aptitude | mock
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    dream_company: '',
    current_skills: '',
    target_date: ''
  });

  // Pre-fill profile skills if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        current_skills: user.skills || ''
      }));
    }
  }, [user]);

  // Fetch Active Roadmap
  const fetchActiveRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roadmap/active');
      if (res.data.active) {
        setActiveRoadmap(res.data);
        setCompletedTasks(new Set(res.data.completed_tasks || []));
        setShowForm(false);
      } else {
        setShowForm(true);
      }
    } catch (err) {
      console.error(err);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRoadmap();
  }, []);

  // Handle Generate Roadmap
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.dream_company.trim()) return alert('Please enter your dream company.');

    setGenerating(true);
    try {
      const res = await api.post('/roadmap/generate', {
        dream_company: formData.dream_company.trim(),
        current_skills: formData.current_skills.split(',').map(s => s.trim()).filter(Boolean),
        target_date: formData.target_date
      });

      setActiveRoadmap({
        roadmap_id: res.data.roadmap_id,
        dream_company: res.data.dream_company,
        target_date: res.data.target_date,
        roadmap: res.data.roadmap
      });
      setCompletedTasks(new Set());
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  // Handle Checkbox Toggle
  const handleToggleTask = async (taskId) => {
    if (!activeRoadmap?.roadmap_id) return;

    const isCurrentlyCompleted = completedTasks.has(taskId);
    const newCompleted = new Set(completedTasks);

    if (isCurrentlyCompleted) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);

    try {
      await api.post('/roadmap/toggle-task', {
        roadmap_id: activeRoadmap.roadmap_id,
        task_id: taskId,
        completed: !isCurrentlyCompleted
      });
    } catch (err) {
      console.error('Failed to toggle task:', err);
      // Rollback on failure
      setCompletedTasks(completedTasks);
    }
  };

  // Collect all task IDs across all categories to calculate progress
  const allTaskIds = useMemo(() => {
    if (!activeRoadmap?.roadmap) return [];
    const rm = activeRoadmap.roadmap;
    const ids = [];

    (rm.daily_plan || []).forEach(item => ids.push(item.id));
    (rm.weekly_plan || []).forEach((item, wIdx) => {
      (item.tasks || []).forEach((_, tIdx) => ids.push(`${item.id}_${tIdx}`));
    });
    (rm.monthly_plan || []).forEach(item => ids.push(item.id));
    (rm.dsa_roadmap || []).forEach(item => ids.push(item.id));
    (rm.sql_roadmap || []).forEach(item => ids.push(item.id));
    (rm.dbms_roadmap || []).forEach(item => ids.push(item.id));
    (rm.oop_roadmap || []).forEach(item => ids.push(item.id));
    (rm.aptitude_plan || []).forEach(item => ids.push(item.id));
    (rm.mock_interview_plan || []).forEach(item => ids.push(item.id));

    return ids;
  }, [activeRoadmap]);

  const totalTasks = allTaskIds.length;
  const completedCount = useMemo(() => {
    let count = 0;
    allTaskIds.forEach(id => {
      if (completedTasks.has(id)) count++;
    });
    return count;
  }, [allTaskIds, completedTasks]);

  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-primary px-3 py-1 rounded-full text-xs font-bold mb-2">
            🚀 AI Preparation Roadmap
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Placement Preparation Plan</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeRoadmap && !showForm
              ? `Personalized strategy to crack ${activeRoadmap.dream_company}`
              : 'Generate a customized daily, weekly, and subject-wise plan tailored to your dream company.'}
          </p>
        </div>

        {activeRoadmap && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 border-2 border-primary text-primary font-bold rounded-xl hover:bg-indigo-50 transition text-sm shadow-sm"
          >
            + Generate New Roadmap
          </button>
        )}
      </div>

      {/* ── Form View ── */}
      {showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-indigo-800 p-8 text-white">
            <h2 className="text-2xl font-bold">Build Your Dream Company Roadmap</h2>
            <p className="text-indigo-200 text-sm mt-1">Our AI will craft a day-by-day and subject-by-subject strategy for you.</p>
          </div>

          <form onSubmit={handleGenerate} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Dream Company *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amazon, Google, Microsoft, TCS, Infosys"
                value={formData.dream_company}
                onChange={(e) => setFormData({ ...formData, dream_company: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Current Skills <span className="text-gray-400 font-normal">(comma-separated)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. React, C++, SQL, Basic DSA"
                value={formData.current_skills}
                onChange={(e) => setFormData({ ...formData, current_skills: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Target Placement Date</label>
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-sm bg-gray-50"
              />
            </div>

            <div className="flex gap-4 pt-4">
              {activeRoadmap && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={generating}
                className="flex-1 py-3.5 bg-gradient-to-r from-primary to-indigo-700 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-primary disabled:opacity-50 shadow-lg"
              >
                {generating ? '✨ Generating Custom Roadmap...' : '⚡ Generate Roadmap'}
              </button>
            </div>
          </form>
        </motion.div>
      ) : activeRoadmap && (
        /* ── Active Roadmap Dashboard View ── */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

          {/* Progress Banner */}
          <div className="bg-gradient-to-r from-primary via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-indigo-100">
                Target: {activeRoadmap.dream_company}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">{activeRoadmap.roadmap?.summary || `Roadmap for ${activeRoadmap.dream_company}`}</h2>
              <p className="text-indigo-200 text-xs sm:text-sm">
                Target Date: {activeRoadmap.target_date ? new Date(activeRoadmap.target_date).toLocaleDateString() : 'Upcoming Drive'} · {completedCount} of {totalTasks} tasks completed
              </p>
            </div>

            {/* Overall Progress Gauge */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex items-center gap-6 flex-shrink-0">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="8" className="text-white/20" fill="transparent" />
                  <circle
                    cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="8"
                    className="text-emerald-400 transition-all duration-700"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={(2 * Math.PI * 32) - (progressPercentage / 100) * (2 * Math.PI * 32)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute font-black text-xl">{progressPercentage}%</span>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-indigo-200 tracking-wider">Overall</p>
                <p className="text-lg font-bold text-white">Completion</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200 custom-scrollbar">
            {[
              { id: 'timeline', label: '📅 Timeline (Daily/Weekly)', icon: '📅' },
              { id: 'dsa', label: '⚡ DSA Roadmap', icon: '⚡' },
              { id: 'sql_dbms', label: '🗄️ SQL & DBMS', icon: '🗄️' },
              { id: 'oop', label: '🧱 OOP Roadmap', icon: '🧱' },
              { id: 'aptitude', label: '🧠 Aptitude & Reasoning', icon: '🧠' },
              { id: 'mock', label: '🎤 Mock Interviews', icon: '🎤' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">

            {/* ── TIMELINE TAB ── */}
            {activeTab === 'timeline' && (
              <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                
                {/* Daily Habits */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">☀️</span> Daily Action Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(activeRoadmap.roadmap?.daily_plan || []).map(item => (
                      <label
                        key={item.id}
                        onClick={() => handleToggleTask(item.id)}
                        className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${completedTasks.has(item.id) ? 'bg-emerald-50/60 border-emerald-200 text-gray-500' : 'bg-gray-50 border-gray-200 hover:border-primary text-gray-800'}`}
                      >
                        <input
                          type="checkbox"
                          checked={completedTasks.has(item.id)}
                          onChange={() => {}} // handled by label onClick
                          className="mt-1 w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                        />
                        <div>
                          <span className={`text-sm font-semibold block ${completedTasks.has(item.id) ? 'line-through text-gray-400' : ''}`}>
                            {item.task}
                          </span>
                          <span className="text-xs text-indigo-600 font-bold mt-1 inline-block bg-indigo-50 px-2 py-0.5 rounded-md">
                            ⏱ {item.time}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Weekly Plan */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">📆</span> Weekly Milestones
                  </h3>
                  <div className="space-y-4">
                    {(activeRoadmap.roadmap?.weekly_plan || []).map((week) => (
                      <div key={week.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <h4 className="font-bold text-indigo-900 mb-3 text-sm">{week.title}</h4>
                        <div className="space-y-2">
                          {(week.tasks || []).map((task, tIdx) => {
                            const taskId = `${week.id}_${tIdx}`;
                            const isDone = completedTasks.has(taskId);
                            return (
                              <label
                                key={taskId}
                                onClick={() => handleToggleTask(taskId)}
                                className={`flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer ${isDone ? 'bg-emerald-100/50 text-gray-400' : 'hover:bg-white text-gray-700'}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => {}}
                                  className="w-4 h-4 text-primary rounded border-gray-300"
                                />
                                <span className={`text-sm ${isDone ? 'line-through' : 'font-medium'}`}>{task}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── DSA ROADMAP TAB ── */}
            {activeTab === 'dsa' && (
              <motion.div key="dsa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">⚡</span> Data Structures & Algorithms Roadmap
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(activeRoadmap.roadmap?.dsa_roadmap || []).map(item => {
                    const isDone = completedTasks.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleTask(item.id)}
                        className={`p-6 rounded-2xl border transition-all cursor-pointer ${isDone ? 'bg-emerald-50/60 border-emerald-200' : 'bg-gray-50 border-gray-200 hover:border-primary'}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className={`font-bold text-base ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.topic}</h4>
                          <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-primary rounded-full">{item.estimated_days}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-semibold mb-3">Key Problems to Solve:</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(item.key_problems || []).map((prob, idx) => (
                            <span key={idx} className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                              {prob}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                          <input type="checkbox" checked={isDone} onChange={() => {}} className="w-4 h-4 rounded text-primary" />
                          <span>{isDone ? 'Topic Completed' : 'Mark Topic Complete'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── SQL & DBMS TAB ── */}
            {activeTab === 'sql_dbms' && (
              <motion.div key="sql_dbms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* SQL */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">🗄️</span> SQL Queries & Optimization
                  </h3>
                  <div className="space-y-3">
                    {(activeRoadmap.roadmap?.sql_roadmap || []).map(item => {
                      const isDone = completedTasks.has(item.id);
                      return (
                        <label
                          key={item.id}
                          onClick={() => handleToggleTask(item.id)}
                          className={`flex items-start gap-3 p-4 rounded-2xl border transition cursor-pointer ${isDone ? 'bg-emerald-50/60 border-emerald-200' : 'bg-gray-50 border-gray-200 hover:border-primary'}`}
                        >
                          <input type="checkbox" checked={isDone} onChange={() => {}} className="mt-1 w-5 h-5 text-primary rounded" />
                          <div>
                            <span className={`font-bold text-sm block ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.topic}</span>
                            <span className="text-xs text-gray-600 mt-1 block">{item.task}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* DBMS */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">🏗️</span> DBMS Core Theory
                  </h3>
                  <div className="space-y-3">
                    {(activeRoadmap.roadmap?.dbms_roadmap || []).map(item => {
                      const isDone = completedTasks.has(item.id);
                      return (
                        <label
                          key={item.id}
                          onClick={() => handleToggleTask(item.id)}
                          className={`flex items-start gap-3 p-4 rounded-2xl border transition cursor-pointer ${isDone ? 'bg-emerald-50/60 border-emerald-200' : 'bg-gray-50 border-gray-200 hover:border-primary'}`}
                        >
                          <input type="checkbox" checked={isDone} onChange={() => {}} className="mt-1 w-5 h-5 text-primary rounded" />
                          <div>
                            <span className={`font-bold text-sm block ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.topic}</span>
                            <span className="text-xs text-gray-600 mt-1 block">{item.task}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}

            {/* ── OOP TAB ── */}
            {activeTab === 'oop' && (
              <motion.div key="oop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <span className="text-xl">🧱</span> Object-Oriented Programming & Design
                </h3>
                {(activeRoadmap.roadmap?.oop_roadmap || []).map(item => {
                  const isDone = completedTasks.has(item.id);
                  return (
                    <label
                      key={item.id}
                      onClick={() => handleToggleTask(item.id)}
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition cursor-pointer ${isDone ? 'bg-emerald-50/60 border-emerald-200' : 'bg-gray-50 border-gray-200 hover:border-primary'}`}
                    >
                      <input type="checkbox" checked={isDone} onChange={() => {}} className="mt-1 w-5 h-5 text-primary rounded" />
                      <div>
                        <span className={`font-bold text-sm block ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.topic}</span>
                        <span className="text-xs text-gray-600 mt-1 block">{item.task}</span>
                      </div>
                    </label>
                  );
                })}
              </motion.div>
            )}

            {/* ── APTITUDE TAB ── */}
            {activeTab === 'aptitude' && (
              <motion.div key="aptitude" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <span className="text-xl">🧠</span> Quantitative Aptitude & Logical Reasoning
                </h3>
                {(activeRoadmap.roadmap?.aptitude_plan || []).map(item => {
                  const isDone = completedTasks.has(item.id);
                  return (
                    <label
                      key={item.id}
                      onClick={() => handleToggleTask(item.id)}
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition cursor-pointer ${isDone ? 'bg-emerald-50/60 border-emerald-200' : 'bg-gray-50 border-gray-200 hover:border-primary'}`}
                    >
                      <input type="checkbox" checked={isDone} onChange={() => {}} className="mt-1 w-5 h-5 text-primary rounded" />
                      <div>
                        <span className={`font-bold text-sm block ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.topic}</span>
                        <span className="text-xs text-gray-600 mt-1 block">{item.task}</span>
                      </div>
                    </label>
                  );
                })}
              </motion.div>
            )}

            {/* ── MOCK INTERVIEW TAB ── */}
            {activeTab === 'mock' && (
              <motion.div key="mock" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <span className="text-xl">🎤</span> Mock Interview Strategy
                </h3>
                {(activeRoadmap.roadmap?.mock_interview_plan || []).map(item => {
                  const isDone = completedTasks.has(item.id);
                  return (
                    <label
                      key={item.id}
                      onClick={() => handleToggleTask(item.id)}
                      className={`flex items-start gap-3 p-5 rounded-2xl border transition cursor-pointer ${isDone ? 'bg-emerald-50/60 border-emerald-200' : 'bg-indigo-50/40 border-indigo-100 hover:border-primary'}`}
                    >
                      <input type="checkbox" checked={isDone} onChange={() => {}} className="mt-1 w-5 h-5 text-primary rounded" />
                      <div>
                        <span className={`font-bold text-sm block ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.stage}</span>
                        <span className="text-xs text-gray-600 mt-1 block">{item.task}</span>
                      </div>
                    </label>
                  );
                })}
              </motion.div>
            )}

          </AnimatePresence>

        </motion.div>
      )}

    </div>
  );
};

export default PreparationRoadmap;
