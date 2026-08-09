import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirm_password) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    const emailDomain = formData.email.split('@')[1]?.toLowerCase() || '';
    if (emailDomain.includes('.edu') || emailDomain.includes('.ac.') || emailDomain.includes('college') || emailDomain.includes('university')) {
      setError("Please use your personal email address (Gmail, Outlook, Yahoo, iCloud, or Hotmail). College email addresses are not allowed.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password
      });
      
      // If the backend returns a successful registration but failed to send email
      if (res.data.message && res.data.message.toLowerCase().includes('failed to send')) {
        setError(res.data.message);
      } else {
        setIsRegistered(true);
        setRegisteredEmail(formData.email);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && data.errors.length > 0) {
        setError(data.errors.map(e => e.message || e.msg).join(', '));
      } else if (data?.message && data.message !== 'Validation failed') {
        setError(data.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');
    try {
      const res = await api.post('/auth/resend-verification', { email: registeredEmail });
      setResendMessage(res.data.message || 'Verification email resent successfully.');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && data.errors.length > 0) {
        setError(data.errors.map(e => e.message || e.msg).join(', '));
      } else if (data?.message && data.message !== 'Validation failed') {
        setError(data.message);
      } else {
        setError('Failed to resend verification email.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full space-y-8 backdrop-blur-xl bg-white/60 p-10 rounded-2xl shadow-xl border border-white/40 text-center"
        >
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            🎉 Registration Successful!
          </h2>
          
          <div className="text-gray-700 text-base space-y-4 text-left bg-white/50 p-6 rounded-lg whitespace-pre-wrap">
            <p>A verification email has been sent to your email address.</p>
            <p>Please check:<br/>• Inbox<br/>• Spam Folder<br/>• Promotions</p>
            <p>After verifying your email, you can login.</p>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded text-center">
              Verification email sent to:<br/>
              <strong>{registeredEmail}</strong>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-left text-sm">
              <p className="font-semibold text-red-800 mb-1">Email sending failed:</p>
              {error}
            </div>
          )}
          {resendMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md text-left text-sm">
              {resendMessage}
            </div>
          )}

          <div className="space-y-4 pt-4">
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-primary bg-indigo-50 hover:bg-indigo-100 focus:outline-none transition-all shadow-sm"
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
            
            <Link
              to="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md"
            >
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 backdrop-blur-xl bg-white/60 p-10 rounded-2xl shadow-xl border border-white/40"
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join CareerCompass AI today
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
            <p className="text-sm">{success}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="full_name" className="sr-only">Full Name</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white/50"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white/50"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative block w-full px-3 py-2 border border-gray-300 bg-blue-50/50 text-xs text-left z-0 text-gray-600 flex items-start">
              <svg className="w-4 h-4 flex-shrink-0 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Use your personal email address (e.g. Gmail, Outlook, Yahoo, iCloud, or Hotmail). College or institutional email addresses are not accepted.</span>
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white/50 pr-10"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center z-20"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="relative block w-full px-3 py-3 border border-gray-300 bg-white/60 text-xs text-left z-0 space-y-1">
              <p className="font-semibold text-gray-700 mb-2">Password must contain:</p>
              <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : 'text-red-500'}`}>
                <span className="mr-2 text-sm font-bold">{formData.password.length >= 8 ? '✓' : '✗'}</span> Minimum 8 characters
              </div>
              <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                <span className="mr-2 text-sm font-bold">{/[A-Z]/.test(formData.password) ? '✓' : '✗'}</span> One uppercase letter
              </div>
              <div className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                <span className="mr-2 text-sm font-bold">{/[a-z]/.test(formData.password) ? '✓' : '✗'}</span> One lowercase letter
              </div>
              <div className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                <span className="mr-2 text-sm font-bold">{/[0-9]/.test(formData.password) ? '✓' : '✗'}</span> One number
              </div>
              <div className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                <span className="mr-2 text-sm font-bold">{/[^A-Za-z0-9]/.test(formData.password) ? '✓' : '✗'}</span> One special character
              </div>
            </div>
            <div className="relative">
              <label htmlFor="confirm_password" className="sr-only">Confirm Password</label>
              <input
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white/50 pr-10"
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center z-20"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
