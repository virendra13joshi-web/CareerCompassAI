import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';

const StatCard = ({ label, value, icon, color, to, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Link to={to} className="block">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
            <p className="text-white text-3xl font-bold">{value ?? '—'}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const difficultyColor = { Easy: 'text-emerald-400 bg-emerald-400/10', Medium: 'text-amber-400 bg-amber-400/10', Hard: 'text-red-400 bg-red-400/10' };
const roleColor = { admin: 'text-indigo-400 bg-indigo-400/10', student: 'text-slate-400 bg-slate-700' };

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentExperiences, setRecentExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => {
        setStats(res.data.stats);
        setRecentStudents(res.data.recent_students || []);
        setRecentExperiences(res.data.recent_experiences || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Total Students', value: stats?.students, to: '/admin/students',
      color: 'bg-indigo-500/20 text-indigo-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
      label: 'Companies', value: stats?.companies, to: '/admin/companies',
      color: 'bg-purple-500/20 text-purple-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    },
    {
      label: 'Interview Experiences', value: stats?.experiences, to: '/admin/experiences',
      color: 'bg-emerald-500/20 text-emerald-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    },
    {
      label: 'Resume Reports', value: stats?.reports, to: '/admin/reports',
      color: 'bg-amber-500/20 text-amber-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    {
      label: 'Roadmaps', value: stats?.roadmaps, to: '/admin/roadmaps',
      color: 'bg-cyan-500/20 text-cyan-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
    },
    {
      label: 'Notifications', value: stats?.notifications, to: '/admin/notifications',
      color: 'bg-rose-500/20 text-rose-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    },
    {
      label: 'AI Chats', value: stats?.chats, to: '/admin/analytics',
      color: 'bg-pink-500/20 text-pink-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
    },
    {
      label: 'View Analytics', value: '→', to: '/admin/analytics',
      color: 'bg-violet-500/20 text-violet-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of your CareerCompass platform</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 0.07} />
        ))}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold">Recent Students</h2>
            <Link to="/admin/students" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">View all →</Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentStudents.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No students yet.</p>
            ) : (
              recentStudents.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{s.full_name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{s.full_name}</p>
                    <p className="text-slate-500 text-xs truncate">{s.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[s.role] || roleColor.student}`}>
                      {s.role}
                    </span>
                    <span className="text-slate-600 text-xs">{s.branch || '—'}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Experiences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold">Recent Experiences</h2>
            <Link to="/admin/experiences" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">View all →</Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentExperiences.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No experiences yet.</p>
            ) : (
              recentExperiences.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{e.company_name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{e.company_name}</p>
                    <p className="text-slate-500 text-xs truncate">{e.role} · by {e.author}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[e.difficulty_level] || 'text-slate-400 bg-slate-700'}`}>
                    {e.difficulty_level}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Company', to: '/admin/companies', color: 'from-purple-600 to-indigo-600' },
            { label: 'Broadcast Notification', to: '/admin/notifications', color: 'from-rose-600 to-pink-600' },
            { label: 'Manage Users', to: '/admin/users', color: 'from-amber-600 to-orange-600' },
            { label: 'View Analytics', to: '/admin/analytics', color: 'from-emerald-600 to-teal-600' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className={`bg-gradient-to-r ${action.color} text-white text-sm font-medium px-4 py-3 rounded-xl text-center hover:opacity-90 hover:scale-[1.02] transition-all duration-150 shadow-lg`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
