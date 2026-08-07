import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const InterviewExperiences = () => {
  const { user } = useContext(AuthContext);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // Form state for submission
  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    interview_date: '',
    difficulty_level: 'Medium',
    technical_questions: '',
    hr_questions: '',
    coding_questions: '',
    tips: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await api.get('/experiences', {
        params: { search, difficulty, page, limit: 9 }
      });
      setExperiences(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [page, difficulty]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExperiences();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to share your experience.');
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/experiences', formData);
      setShowModal(false);
      setFormData({
        company_name: '', role: '', interview_date: '', difficulty_level: 'Medium',
        technical_questions: '', hr_questions: '', coding_questions: '', tips: ''
      });
      fetchExperiences();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error submitting experience.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (e, expId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert('Please login to like experiences.');

    try {
      const res = await api.post(`/experiences/${expId}/like`);
      const isLiked = res.data.is_liked;

      setExperiences(prev => prev.map(item => {
        if (item.id === expId) {
          return {
            ...item,
            is_liked: isLiked ? 1 : 0,
            likes_count: isLiked ? item.likes_count + 1 : item.likes_count - 1
          };
        }
        return item;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Experiences</h1>
          <p className="text-gray-500 mt-1">Real interview questions and prep strategies shared by fellow students.</p>
        </div>
        <button
          onClick={() => {
            if (!user) return alert('Please login to share your experience.');
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-primary to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          + Share Your Experience
        </button>
      </div>

      {/* Filter & Search Bar */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <input
            type="text"
            placeholder="Search company, role, or question keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none flex-1 min-w-[220px] text-sm"
          />
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors text-sm"
        >
          Search
        </button>
      </form>

      {/* Experience Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-xl font-bold text-gray-800">No interview experiences found</h3>
          <p className="text-gray-500 mt-1 text-sm">Be the first to share an experience for this company!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 leading-snug">{exp.company_name}</h3>
                    <p className="text-sm font-semibold text-primary">{exp.role}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${difficultyColors[exp.difficulty_level] || difficultyColors.Medium}`}>
                    {exp.difficulty_level}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                  Shared by <strong className="text-gray-600">{exp.author_name || 'Anonymous Student'}</strong> {exp.interview_date ? `· Interviewed ${new Date(exp.interview_date).toLocaleDateString()}` : ''}
                </p>

                {/* Snippets Preview */}
                <div className="space-y-3 text-sm text-gray-600 mb-4 line-clamp-3">
                  {exp.technical_questions && (
                    <p><strong className="text-gray-800">Tech Qs:</strong> {exp.technical_questions.substring(0, 100)}...</p>
                  )}
                  {exp.coding_questions && (
                    <p><strong className="text-gray-800">Coding:</strong> {exp.coding_questions.substring(0, 100)}...</p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                  <button
                    onClick={(e) => handleLike(e, exp.id)}
                    className={`flex items-center gap-1 transition-colors ${exp.is_liked ? 'text-red-500 font-bold' : 'hover:text-red-500'}`}
                  >
                    <svg className="w-4 h-4" fill={exp.is_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{exp.likes_count || 0}</span>
                  </button>
                  <span className="flex items-center gap-1">
                    💬 {exp.comments_count || 0}
                  </span>
                </div>
                
                <Link
                  to={`/interview-experiences/${exp.id}`}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Read Full Experience →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
          >
            Previous
          </button>
          <span className="px-4 py-2 flex items-center font-medium text-gray-700 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
          >
            Next
          </button>
        </div>
      )}

      {/* ── Share Experience Modal ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">Share Interview Experience</h2>
              <p className="text-xs text-gray-500 mb-6">Help fellow students prepare by sharing your interview rounds and tips.</p>

              {formError && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs">{formError}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text" required name="company_name" value={formData.company_name} onChange={handleInputChange}
                      placeholder="e.g. Amazon, Google, TCS"
                      className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Role *</label>
                    <input
                      type="text" required name="role" value={formData.role} onChange={handleInputChange}
                      placeholder="e.g. SDE-1, Graduate Trainee"
                      className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Interview Date</label>
                    <input
                      type="date" name="interview_date" value={formData.interview_date} onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Overall Difficulty</label>
                    <select
                      name="difficulty_level" value={formData.difficulty_level} onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary outline-none bg-white"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Technical Questions Asked</label>
                  <textarea
                    name="technical_questions" rows="2" value={formData.technical_questions} onChange={handleInputChange}
                    placeholder="List technical questions, OS, DBMS, OOP topics covered..."
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Coding / Problem Solving Questions</label>
                  <textarea
                    name="coding_questions" rows="2" value={formData.coding_questions} onChange={handleInputChange}
                    placeholder="Mention coding problem statements or DSA topics..."
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">HR Questions</label>
                  <textarea
                    name="hr_questions" rows="2" value={formData.hr_questions} onChange={handleInputChange}
                    placeholder="HR questions asked, situational questions, project questions..."
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tips for Future Aspirants</label>
                  <textarea
                    name="tips" rows="2" value={formData.tips} onChange={handleInputChange}
                    placeholder="What should students focus on? Any key advice?"
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button" onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Post Experience'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewExperiences;
