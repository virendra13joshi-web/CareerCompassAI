import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // --- Mock Data for Charts ---
  
  // 1. Company Applications (Bar Chart)
  const applicationsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Applications Submitted',
        data: [5, 8, 12, 7, 15, 20],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderRadius: 6,
      },
      {
        label: 'Interviews Scheduled',
        data: [2, 3, 5, 2, 8, 10],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 6,
      }
    ],
  };

  // 2. Progress Chart (Line Chart)
  const progressData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    datasets: [
      {
        label: 'Mock Test Scores (%)',
        data: [65, 72, 70, 85, 92],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  // 3. Skills Progress (Radar Chart)
  const skillsData = {
    labels: ['Algorithms', 'System Design', 'React', 'Node.js', 'SQL', 'Communication'],
    datasets: [
      {
        label: 'Current Skill Level',
        data: [80, 60, 90, 85, 75, 88],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: '#4F46E5',
        pointBackgroundColor: '#4F46E5',
      }
    ],
  };

  // 4. Placement Statistics (Doughnut Chart)
  const statsData = {
    labels: ['Applied', 'Interviewing', 'Offered', 'Rejected'],
    datasets: [
      {
        data: [25, 8, 2, 15],
        backgroundColor: [
          '#6366f1', // indigo
          '#f59e0b', // amber
          '#10b981', // emerald
          '#ef4444', // red
        ],
        borderWidth: 0,
      }
    ],
  };

  // --- Mock Data for Widgets ---
  const upcomingCompanies = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys'];
  const dailyTasks = [
    { id: 1, task: 'Solve 2 Leetcode Mediums', done: true },
    { id: 2, task: 'Review System Design Primer', done: false },
    { id: 3, task: 'Update Resume with new project', done: false },
  ];
  const interviewFeed = [
    { name: 'Rahul S.', company: 'Amazon', role: 'SDE-1', exp: 'Focused heavily on Graphs and DP. Leadership principles were key.' },
    { name: 'Priya K.', company: 'Microsoft', role: 'SWE', exp: 'System design round was about designing a tinyURL service. Smooth process.' },
  ];
  const aiSuggestions = [
    { role: 'Frontend Engineer', company: 'Atlassian', match: '95%' },
    { role: 'Full Stack Developer', company: 'Stripe', match: '88%' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Motivation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-indigo-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 🚀</h1>
          <p className="mt-2 text-indigo-200">"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
          <p className="text-sm uppercase tracking-wider text-indigo-100 font-semibold">Daily Streak</p>
          <p className="text-3xl font-bold">14 Days</p>
        </div>
      </motion.div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Placement Readiness</p>
            <h2 className="text-4xl font-bold text-gray-900 mt-1">78%</h2>
            <p className="text-green-500 text-sm font-medium mt-2">↑ 5% this week</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin-slow"></div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Resume ATS Score</p>
            <h2 className="text-4xl font-bold text-gray-900 mt-1">85/100</h2>
            <p className="text-green-500 text-sm font-medium mt-2">Excellent Match</p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Active Applications</p>
            <h2 className="text-4xl font-bold text-gray-900 mt-1">12</h2>
            <p className="text-indigo-500 text-sm font-medium mt-2">3 Interviews Pending</p>
          </div>
          <div className="bg-indigo-100 p-4 rounded-full">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Application Trends</h3>
          <Bar data={applicationsData} options={{ responsive: true }} />
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Preparation Progress</h3>
          <Line data={progressData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Skill Assessment</h3>
          <div className="h-64 flex justify-center">
             <Radar data={skillsData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Placement Pipeline</h3>
          <div className="h-64 flex justify-center">
             <Doughnut data={statsData} options={{ maintainAspectRatio: false, cutout: '70%' }} />
          </div>
        </div>

        {/* Daily Tasks Widget */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Targets</h3>
          <div className="flex-1 space-y-4">
            {dailyTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary transition-colors cursor-pointer">
                <input type="checkbox" checked={task.done} readOnly className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary" />
                <span className={`text-sm font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {task.task}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 bg-indigo-50 text-primary font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
            Add New Task
          </button>
        </div>
      </div>

      {/* Widgets Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Company Lists */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Companies</h3>
            <div className="flex gap-2">
              <span className="text-xs font-semibold px-2 py-1 bg-primary text-white rounded-md cursor-pointer">Upcoming</span>
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md cursor-pointer hover:bg-gray-200">Eligible</span>
            </div>
          </div>
          <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
            {upcomingCompanies.map((company, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500">
                    {company.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{company}</h4>
                    <p className="text-xs text-gray-500">Visiting in {idx + 2} days</p>
                  </div>
                </div>
                <button className="text-primary text-sm font-medium hover:underline">Details</button>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path></svg>
            Interview Feed
          </h3>
          <div className="overflow-y-auto space-y-4 flex-1 pr-2 custom-scrollbar">
            {interviewFeed.map((feed, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-800">{feed.company}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{feed.role}</span>
                </div>
                <p className="text-sm text-gray-600 italic">"{feed.exp}"</p>
                <p className="text-xs text-gray-400 mt-2 text-right">- {feed.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Career Suggestions */}
        <div className="bg-gradient-to-br from-indigo-900 to-primary p-6 rounded-2xl shadow-sm text-white h-96 flex flex-col relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
          
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2 relative z-10">
            <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            AI Career Matches
          </h3>
          <p className="text-indigo-200 text-xs mb-4 relative z-10">Based on your skills and ATS score</p>
          
          <div className="space-y-3 flex-1 relative z-10">
            {aiSuggestions.map((suggestion, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">{suggestion.role}</span>
                  <span className="text-xs font-bold bg-green-400 text-green-900 px-2 py-1 rounded-full">{suggestion.match} Match</span>
                </div>
                <p className="text-sm text-indigo-100">{suggestion.company}</p>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 bg-white text-primary font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-lg relative z-10">
            Explore All Matches
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
