import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(res.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 backdrop-blur-xl bg-white/60 p-10 rounded-2xl shadow-xl border border-white/40 text-center"
      >
        {status === 'verifying' && (
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Verifying Email...</h2>
            <div className="mt-4 animate-pulse flex space-x-4 justify-center">
              <div className="rounded-full bg-primary h-10 w-10"></div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div>
             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Verified!</h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
            <div className="mt-6">
              <Link to="/login" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700">
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
            <div className="mt-6">
              <Link to="/register" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700">
                Back to Register
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
