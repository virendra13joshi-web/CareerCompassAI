import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ExperienceDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchExperience = async () => {
    try {
      const res = await api.get(`/experiences/${id}`);
      setExp(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperience();
  }, [id]);

  const handleLike = async () => {
    if (!user) return alert('Please login to like this post.');
    try {
      const res = await api.post(`/experiences/${id}/like`);
      const isLiked = res.data.is_liked;
      setExp(prev => ({
        ...prev,
        is_liked: isLiked,
        likes_count: isLiked ? prev.likes_count + 1 : prev.likes_count - 1
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to comment.');
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await api.post(`/experiences/${id}/comment`, { comment: newComment.trim() });
      setNewComment('');
      fetchExperience(); // Refresh comments list
    } catch (err) {
      alert('Error posting comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exp) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Experience not found</h2>
        <Link to="/interview-experiences" className="text-primary hover:underline mt-4 inline-block font-semibold">
          ← Back to all experiences
        </Link>
      </div>
    );
  }

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/interview-experiences" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 mb-6">
        ← Back to all experiences
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-8"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-primary p-8 text-white relative">
          <div className="flex justify-between items-start">
            <div>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-3 ${difficultyColors[exp.difficulty_level] || difficultyColors.Medium}`}>
                {exp.difficulty_level} Difficulty
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold">{exp.company_name}</h1>
              <p className="text-indigo-200 text-lg font-medium mt-1">{exp.role}</p>
            </div>
            
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${exp.is_liked ? 'bg-red-500 text-white' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}
            >
              <svg className="w-5 h-5" fill={exp.is_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{exp.likes_count || 0} Likes</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-indigo-200">
            <span>👤 Shared by <strong className="text-white">{exp.author_name || 'Anonymous Student'}</strong> ({exp.author_branch || 'CSE'})</span>
            {exp.interview_date && <span>📅 Interview Date: {new Date(exp.interview_date).toLocaleDateString()}</span>}
            <span>🕒 Posted: {new Date(exp.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-8">
          
          {/* Technical Questions */}
          {exp.technical_questions && (
            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">💻</span> Technical Questions
              </h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{exp.technical_questions}</p>
            </section>
          )}

          {/* Coding Questions */}
          {exp.coding_questions && (
            <section className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">⚡</span> Coding / Problem Solving
              </h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{exp.coding_questions}</p>
            </section>
          )}

          {/* HR Questions */}
          {exp.hr_questions && (
            <section className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🎤</span> HR & Behavioral Questions
              </h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{exp.hr_questions}</p>
            </section>
          )}

          {/* Tips */}
          {exp.tips && (
            <section className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="text-lg font-bold text-emerald-950 mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span> Tips for Candidates
              </h3>
              <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{exp.tips}</p>
            </section>
          )}

        </div>
      </motion.div>

      {/* ── Comments Section ── */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>💬</span> Comments ({exp.comments?.length || 0})
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="mb-8">
          <textarea
            rows="3"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Ask a question or share your thoughts on this experience..." : "Please log in to leave a comment."}
            disabled={!user}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-sm text-gray-800 resize-none disabled:opacity-50"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!user || !newComment.trim() || submittingComment}
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition shadow-sm text-sm"
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {!exp.comments || exp.comments.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">No comments yet. Start the conversation!</p>
          ) : (
            exp.comments.map((c) => (
              <div key={c.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-gray-900">{c.author_name}</span>
                  <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;
