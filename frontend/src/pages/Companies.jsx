import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, MapPin, Briefcase, GraduationCap, 
  ChevronRight, Building2, Banknote, 
  CalendarDays
} from 'lucide-react';
import api from '../services/api';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies', {
        params: { search, min_cgpa: minCgpa, location, sort_by: sortBy, page, limit: 9 }
      });
      setCompanies(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCompanies();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Opportunities</span>
              </h1>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Explore top companies hiring on campus. Filter by role, location, and package to find your perfect match.
              </p>
            </div>

            {/* Filters */}
            <form onSubmit={handleSearch} className="w-full lg:w-auto flex flex-col sm:flex-row flex-wrap gap-3">
              <div className="relative flex-grow sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search role or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                />
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Min CGPA"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-28 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-grow sm:flex-grow-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none text-gray-700 appearance-none pr-8 cursor-pointer relative"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                >
                  <option value="created_at">Newest First</option>
                  <option value="application_deadline">Deadline Approaching</option>
                  <option value="company_name">Company A-Z</option>
                </select>
                <button type="submit" className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap">
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 h-80 animate-pulse border border-gray-100 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl"></div>
                  <div className="space-y-3 flex-1 py-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">No opportunities found</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, i) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 flex flex-col h-full transition-all duration-300 relative overflow-hidden"
              >
                {/* Eligible Badge */}
                {company.eligibility_cgpa && (
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-green-500 to-emerald-400 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl z-10 shadow-sm flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" /> CGPA {company.eligibility_cgpa}+
                  </div>
                )}
                
                {/* Header */}
                <div className="flex items-start gap-4 mb-5 relative z-10 pt-2">
                  <div className="shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center">
                    {company.logo_url ? (
                      <img src={`http://localhost:5000${company.logo_url}`} alt={company.company_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 leading-tight group-hover:text-primary transition-colors">{company.company_name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1.5 gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {company.location || 'Remote'}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 mb-6">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {company.job_role}
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-indigo-100">
                      <Banknote className="w-4 h-4" />
                      {company.package_lpa ? `${company.package_lpa} LPA` : 'Not disclosed'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-100">
                      <CalendarDays className="w-4 h-4" />
                      {company.deadline ? new Date(company.application_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Rolling'}
                    </span>
                  </div>
                  
                  {/* Skills/Branches Chips */}
                  {company.required_skills && company.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {company.required_skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">
                          {skill}
                        </span>
                      ))}
                      {company.required_skills.length > 3 && (
                         <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded-md text-xs font-medium border border-gray-200">
                           +{company.required_skills.length - 3}
                         </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-5 border-t border-gray-100 mt-auto">
                  <Link 
                    to={`/companies/${company.id}`} 
                    className="flex items-center justify-center gap-2 w-full bg-white text-gray-900 border-2 border-gray-900 font-semibold py-2.5 rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-300"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-8 pb-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700 shadow-sm"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700 shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
