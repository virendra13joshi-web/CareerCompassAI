import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
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
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to receive a reset link
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
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white/50"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
