import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkClass = (path) => {
    const isActive = currentPath === path || (path !== '/' && currentPath.startsWith(path));
    return `font-medium transition-colors ${isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-700 hover:text-primary'}`;
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
          CareerCompass<span className="text-secondary">AI</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/companies" className={getLinkClass('/companies')}>
            Companies
          </Link>
          <Link to="/interview-experiences" className={getLinkClass('/interview-experiences')}>
            Experiences
          </Link>
          <Link to="/analytics" className={getLinkClass('/analytics')}>
            Analytics
          </Link>
          <Link to="/eligibility" className={getLinkClass('/eligibility')}>
            Eligibility Check
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link to="/resume-analyzer" className={getLinkClass('/resume-analyzer')}>
                AI Resume
              </Link>
              <Link to="/career-chat" className={getLinkClass('/career-chat')}>
                AI Chat
              </Link>
              <Link to="/roadmap" className={getLinkClass('/roadmap')}>
                Roadmap
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-md">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Admin
                </Link>
              )}
              <Link to="/profile" className={getLinkClass('/profile')}>
                Profile
              </Link>
              <NotificationBell />
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4 ml-2">
              <Link 
                to="/login" 
                className="px-5 py-2 rounded-lg border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white font-medium transition-all duration-300"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
