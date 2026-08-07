import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

const CHART_COLORS = {
  indigo: 'rgba(99, 102, 241, 0.8)',
  purple: 'rgba(168, 85, 247, 0.8)',
  emerald: 'rgba(52, 211, 153, 0.8)',
  amber: 'rgba(251, 191, 36, 0.8)',
  rose: 'rgba(251, 113, 133, 0.8)',
  cyan: 'rgba(34, 211, 238, 0.8)',
  slate: 'rgba(148, 163, 184, 0.8)',
  palette: [
    'rgba(99,102,241,0.8)', 'rgba(168,85,247,0.8)', 'rgba(52,211,153,0.8)',
    'rgba(251,191,36,0.8)', 'rgba(251,113,133,0.8)', 'rgba(34,211,238,0.8)',
    'rgba(248,113,113,0.8)', 'rgba(74,222,128,0.8)',
  ],
};

const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
    },
  },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
  },
};

const KPICard = ({ label, value, color, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
        <p className="text-white text-2xl font-bold">{value ?? '—'}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
  >
    <h3 className="text-white font-semibold mb-4 text-sm">{title}</h3>
    <div className="h-56">{children}</div>
  </motion.div>
);

const AnalyticsAdmin = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-slate-400 text-center py-12">Failed to load analytics.</p>;
  }

  const { summary, charts } = data;

  // Monthly registrations chart
  const monthlyRegData = {
    labels: charts.monthly_registrations.map(r => r.month),
    datasets: [{
      label: 'New Registrations',
      data: charts.monthly_registrations.map(r => r.count),
      borderColor: CHART_COLORS.indigo,
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: CHART_COLORS.indigo,
    }],
  };

  // Branch distribution chart
  const branchData = {
    labels: charts.branch_distribution.map(b => b.branch),
    datasets: [{
      label: 'Students',
      data: charts.branch_distribution.map(b => b.count),
      backgroundColor: CHART_COLORS.palette,
      borderRadius: 6,
    }],
  };

  // Role donut
  const roleData = {
    labels: charts.role_distribution.map(r => r.role),
    datasets: [{
      data: charts.role_distribution.map(r => r.count),
      backgroundColor: [CHART_COLORS.indigo, CHART_COLORS.emerald],
      borderWidth: 0,
    }],
  };

  // Top companies bar
  const companyData = {
    labels: charts.top_companies.map(c => c.company_name),
    datasets: [{
      label: 'Applications',
      data: charts.top_companies.map(c => c.applications),
      backgroundColor: CHART_COLORS.purple,
      borderRadius: 6,
    }],
  };

  // Top skills radar
  const skillLabels = charts.top_skills.map(s => s.skill);
  const skillValues = charts.top_skills.map(s => s.count);
  const skillRadarData = {
    labels: skillLabels,
    datasets: [{
      label: 'Demand',
      data: skillValues,
      borderColor: CHART_COLORS.cyan,
      backgroundColor: 'rgba(34,211,238,0.1)',
      pointBackgroundColor: CHART_COLORS.cyan,
      pointBorderColor: '#0f172a',
    }],
  };

  // Difficulty distribution donut
  const diffData = {
    labels: charts.difficulty_distribution.map(d => d.difficulty_level),
    datasets: [{
      data: charts.difficulty_distribution.map(d => d.count),
      backgroundColor: [CHART_COLORS.emerald, CHART_COLORS.amber, CHART_COLORS.rose],
      borderWidth: 0,
    }],
  };

  // ATS distribution bar
  const ats = charts.ats_distribution;
  const atsData = {
    labels: ['Poor (<40)', 'Average (40-59)', 'Good (60-79)', 'Excellent (80+)'],
    datasets: [{
      label: 'Resumes',
      data: [ats.poor || 0, ats.average || 0, ats.good || 0, ats.excellent || 0],
      backgroundColor: [CHART_COLORS.rose, CHART_COLORS.amber, CHART_COLORS.indigo, CHART_COLORS.emerald],
      borderRadius: 6,
    }],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 10, font: { size: 11 } } },
      tooltip: baseChartOptions.plugins.tooltip,
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: baseChartOptions.plugins.tooltip,
    },
    scales: {
      r: {
        ticks: { color: '#64748b', backdropColor: 'transparent', font: { size: 10 } },
        grid: { color: '#1e293b' },
        pointLabels: { color: '#94a3b8', font: { size: 11 } },
      },
    },
  };

  const kpis = [
    { label: 'Total Students', value: summary.total_students, color: 'bg-indigo-500/20 text-indigo-400', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { label: 'Companies', value: summary.total_companies, color: 'bg-purple-500/20 text-purple-400', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { label: 'Applications', value: summary.total_applications, color: 'bg-emerald-500/20 text-emerald-400', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Placed (Offered)', value: summary.total_placed, color: 'bg-amber-500/20 text-amber-400', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
    { label: 'Resume Reports', value: summary.total_reports, color: 'bg-cyan-500/20 text-cyan-400', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { label: 'Roadmaps', value: summary.total_roadmaps, color: 'bg-rose-500/20 text-rose-400', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time insights from your CareerCompass platform</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((k, i) => <KPICard key={k.label} {...k} delay={i * 0.06} />)}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ChartCard title="📈 Student Registrations (Last 6 Months)" delay={0.3}>
            {charts.monthly_registrations.length > 0
              ? <Line data={monthlyRegData} options={{ ...baseChartOptions }} />
              : <p className="text-slate-500 text-sm text-center pt-16">Not enough data yet.</p>
            }
          </ChartCard>
        </div>
        <ChartCard title="👤 Role Distribution" delay={0.35}>
          {charts.role_distribution.length > 0
            ? <Doughnut data={roleData} options={donutOptions} />
            : <p className="text-slate-500 text-sm text-center pt-16">No data.</p>
          }
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="🏛️ Branch-wise Student Count" delay={0.4}>
          {charts.branch_distribution.length > 0
            ? <Bar data={branchData} options={{ ...baseChartOptions, indexAxis: 'y' }} />
            : <p className="text-slate-500 text-sm text-center pt-16">No branch data.</p>
          }
        </ChartCard>
        <ChartCard title="🏢 Top Companies by Applications" delay={0.45}>
          {charts.top_companies.length > 0
            ? <Bar data={companyData} options={baseChartOptions} />
            : <p className="text-slate-500 text-sm text-center pt-16">No application data.</p>
          }
        </ChartCard>
      </div>

      {/* Charts row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="🛠️ Top Skills in Demand" delay={0.5}>
          <Radar data={skillRadarData} options={radarOptions} />
        </ChartCard>
        <ChartCard title="🎯 Interview Difficulty Distribution" delay={0.55}>
          {charts.difficulty_distribution.length > 0
            ? <Doughnut data={diffData} options={donutOptions} />
            : <p className="text-slate-500 text-sm text-center pt-16">No data.</p>
          }
        </ChartCard>
        <ChartCard title="📄 ATS Score Distribution" delay={0.6}>
          <Bar data={atsData} options={baseChartOptions} />
        </ChartCard>
      </div>
    </div>
  );
};

export default AnalyticsAdmin;
