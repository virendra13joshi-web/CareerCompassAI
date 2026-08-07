import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

const PlacementAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { summary, charts } = data || {};

  // 1. Company Hiring Bar Chart Data
  const companyHiringChartData = {
    labels: charts?.company_hiring?.labels || [],
    datasets: [
      {
        label: 'Offers Extended',
        data: charts?.company_hiring?.data || [],
        backgroundColor: 'rgba(79, 70, 229, 0.85)',
        borderColor: '#4F46E5',
        borderWidth: 1,
        borderRadius: 8,
      }
    ]
  };

  // 2. Placement Status Doughnut Chart Data
  const placementStatusChartData = {
    labels: charts?.placement_status?.labels || [],
    datasets: [
      {
        data: charts?.placement_status?.data || [],
        backgroundColor: ['#10b981', '#f59e0b', '#64748b'],
        borderWidth: 0,
      }
    ]
  };

  // 3. Branch Wise Placement Bar Chart Data
  const branchPlacementChartData = {
    labels: charts?.branch_placement?.labels || [],
    datasets: [
      {
        label: 'Placement Percentage (%)',
        data: charts?.branch_placement?.data || [],
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 8,
      }
    ]
  };

  // 4. Skill Demand Radar Chart Data
  const skillDemandChartData = {
    labels: charts?.skill_demand?.labels || [],
    datasets: [
      {
        label: 'Demand Index',
        data: charts?.skill_demand?.data || [],
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: '#6366f1',
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4f46e5',
      }
    ]
  };

  // 5. Student Progress Dual Line Chart Data
  const studentProgressChartData = {
    labels: charts?.student_progress?.labels || [],
    datasets: [
      {
        label: 'Avg Mock Score (%)',
        data: charts?.student_progress?.mock_scores || [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Task Completion Rate (%)',
        data: charts?.student_progress?.tasks_completed || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-primary px-3 py-1 rounded-full text-xs font-bold mb-2">
          📊 Data-Driven Insights
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Placement Analytics & Trends</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time statistics on packages, company hiring, branch performance, and skill demand aggregated from MySQL.</p>
      </motion.div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Average Package */}
        <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Average Package</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{summary?.avg_package}</h2>
            <p className="text-emerald-500 text-xs font-semibold mt-2">↑ 12% vs last year</p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 text-primary rounded-2xl flex items-center justify-center text-2xl font-bold">
            💰
          </div>
        </motion.div>

        {/* Highest Package */}
        <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Highest Package</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{summary?.max_package}</h2>
            <p className="text-emerald-500 text-xs font-semibold mt-2">All-time Record</p>
          </div>
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
            🏆
          </div>
        </motion.div>

        {/* Placement Percentage */}
        <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Placement Rate</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{summary?.placement_percentage}</h2>
            <p className="text-gray-500 text-xs font-semibold mt-2">{summary?.placed_students} of {summary?.total_students} Placed</p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
            📈
          </div>
        </motion.div>

        {/* Participating Companies */}
        <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Hiring Companies</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{summary?.participating_companies}</h2>
            <p className="text-indigo-500 text-xs font-semibold mt-2">Active Drives</p>
          </div>
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
            🏢
          </div>
        </motion.div>

      </div>

      {/* ── Main Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Company-Wise Hiring (Bar Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Company-Wise Hiring</h3>
              <p className="text-xs text-gray-400">Total offers extended by top recruiters</p>
            </div>
            <span className="text-xs bg-indigo-50 text-primary font-bold px-3 py-1 rounded-full">Top Recruiters</span>
          </div>
          <div className="h-72">
            <Bar data={companyHiringChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </motion.div>

        {/* Placement Percentage Breakdown (Doughnut Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Placement Status Breakdown</h3>
              <p className="text-xs text-gray-400">Distribution of batch across statuses</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full">{summary?.placement_percentage} Placed</span>
          </div>
          <div className="h-72 flex justify-center">
            <Doughnut data={placementStatusChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%' }} />
          </div>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Branch-Wise Placement (Bar Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Branch-Wise Placement Percentage</h3>
              <p className="text-xs text-gray-400">Percentage of placed students per engineering discipline</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">Branch Split</span>
          </div>
          <div className="h-72">
            <Bar data={branchPlacementChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </motion.div>

        {/* Skill Demand Index (Radar Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Skill Demand Index</h3>
              <p className="text-xs text-gray-400">Most requested tech skills</p>
            </div>
          </div>
          <div className="h-72 flex justify-center">
            <Radar data={skillDemandChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </motion.div>

      </div>

      {/* Student Progress Trend Line Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Student Preparation & Score Progress Trend</h3>
            <p className="text-xs text-gray-400">Weekly progression of mock scores vs roadmap task completion</p>
          </div>
          <span className="text-xs bg-indigo-50 text-primary font-bold px-3 py-1 rounded-full">Weekly Trend</span>
        </div>
        <div className="h-72">
          <Line data={studentProgressChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </motion.div>

    </div>
  );
};

export default PlacementAnalytics;
