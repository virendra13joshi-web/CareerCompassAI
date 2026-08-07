import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && data.errors.length > 0) {
        setError(data.errors.map(e => e.message || e.msg).join(', '));
      } else if (data?.message && data.message !== 'Validation failed') {
        setError(data.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 backdrop-blur-xl bg-white/60 p-10 rounded-2xl shadow-xl border border-white/40"
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white/50"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white/50"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600">
          <Link to="/login" className="font-medium text-primary hover:text-indigo-500">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
