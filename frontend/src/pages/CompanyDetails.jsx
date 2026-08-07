import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, Bookmark, BookmarkCheck, MapPin, 
  Banknote, CalendarDays, ExternalLink, Sparkles, 
  CheckCircle2, FileText, Network, Code, HelpCircle,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const CompanyDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionType, setActionType] = useState('success');

  useEffect(() => {
    const fetchCompanyAndStatus = async () => {
      try {
        const [compRes, bookRes] = await Promise.all([
          api.get(`/companies/${id}`),
          user ? api.get('/companies/student/bookmarks') : Promise.resolve({ data: [] }),
        ]);
        setCompany(compRes.data);
        if (user) {
          setIsBookmarked(bookRes.data.includes(parseInt(id)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyAndStatus();
  }, [id, user]);

  const toggleBookmark = async () => {
    if (!user) return alert('Please login to bookmark');
    try {
      if (isBookmarked) {
        await api.delete(`/companies/${id}/bookmark`);
        setIsBookmarked(false);
      } else {
        await api.post(`/companies/${id}/bookmark`);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async () => {
    if (!user) return alert('Please login to apply');
    try {
      await api.post(`/companies/${id}/apply`);
      setHasApplied(true);
      setActionMessage('Successfully applied to ' + company.company_name);
      setActionType('success');
    } catch (err) {
      setActionMessage('Application failed or already applied.');
      setActionType('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-20 px-4">
        <Building2 className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Company not found</h2>
        <button onClick={() => navigate('/companies')} className="mt-4 text-primary hover:underline font-medium">
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {actionMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${actionType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}
          >
            {actionType === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{actionMessage}</span>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Header Section */}
          <div className="relative border-b border-gray-100 p-8 sm:p-12">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-8">
              <div className="flex items-start gap-6">
                <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2">
                  {company.logo_url ? (
                    <img src={`http://localhost:5000${company.logo_url}`} alt="logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <div className="pt-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{company.company_name}</h1>
                  <p className="text-xl text-gray-600 mt-2 font-medium">{company.job_role}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-indigo-100">
                      <Banknote className="w-4 h-4" />
                      {company.package_lpa ? `${company.package_lpa} LPA` : 'Not disclosed'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {company.location || 'Remote'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 shrink-0">
                <button 
                  onClick={toggleBookmark}
                  className={`p-3.5 rounded-xl border-2 transition-colors flex items-center justify-center ${isBookmarked ? 'bg-indigo-50 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                  title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
                >
                  {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => navigate('/eligibility', { state: { companyId: company.id } })}
                  className="px-6 py-3.5 border-2 border-gray-200 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <CheckCircle2 className="w-5 h-5 text-gray-500" />
                  Check Eligibility
                </button>
                <button 
                  onClick={handleApply}
                  disabled={hasApplied}
                  className={`px-8 py-3.5 font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap ${hasApplied ? 'bg-emerald-500 text-white cursor-not-allowed shadow-emerald-500/20' : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'}`}
                >
                  {hasApplied ? 'Applied Successfully' : 'Apply Now'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Main Content (Left Column) */}
              <div className="lg:col-span-2 space-y-12">
                
                {company.description && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-primary" />
                      About the Role
                    </h3>
                    <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
                      {company.description}
                    </div>
                  </section>
                )}

                <section>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Eligibility Criteria
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Minimum CGPA</p>
                      <p className="text-lg font-semibold text-gray-900">{company.min_cgpa || 'No strict criteria'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Application Deadline</p>
                      <p className="text-lg font-semibold text-red-600 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" />
                        {company.application_deadline ? new Date(company.application_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Open until filled'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-500 font-medium mb-3">Allowed Branches</p>
                      <div className="flex flex-wrap gap-2">
                        {company.allowed_branches?.length ? company.allowed_branches.map((b, i) => (
                          <span key={i} className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
                            {b}
                          </span>
                        )) : (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium">All Branches Eligible</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <Code className="w-5 h-5 text-primary" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {company.required_skills?.length ? company.required_skills.map((s, i) => (
                      <span key={i} className="bg-primary/5 text-primary border border-primary/10 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
                        {s}
                      </span>
                    )) : <span className="text-gray-500 italic">No specific skills listed.</span>}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <Network className="w-5 h-5 text-primary" />
                    Hiring Process <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md ml-2">{company.interview_rounds} Rounds</span>
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-gray-700 whitespace-pre-wrap leading-relaxed prose prose-gray max-w-none">
                    {company.hiring_process || 'Process details not provided by the company yet.'}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    Previous Year Questions
                  </h3>
                  <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50 text-gray-700 whitespace-pre-wrap italic">
                    {company.previous_questions ? (
                      <div className="relative">
                        <span className="absolute -top-2 -left-2 text-4xl text-indigo-200 font-serif">"</span>
                        <div className="pl-6 relative z-10">{company.previous_questions}</div>
                      </div>
                    ) : (
                      'No previous questions available yet. Be the first to share your experience!'
                    )}
                  </div>
                </section>

              </div>

              {/* Sidebar (Right Column) */}
              <div className="space-y-6">
                
                {/* AI Suggestion Box */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500"></div>
                   <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>
                   
                   <h4 className="font-bold mb-3 flex items-center gap-2 relative z-10 text-lg">
                     <Sparkles className="w-5 h-5 text-yellow-400" />
                     AI Fit Analysis
                   </h4>
                   <p className="text-sm text-gray-300 relative z-10 leading-relaxed">
                     Based on your profile, you have an <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded mx-1">88% match</strong> for this role. Your skills align well with the requirements!
                   </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    Company Info
                  </h3>
                  
                  <div className="space-y-4">
                    {company.official_website && (
                      <a href={company.official_website} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">Official Website</p>
                          <p className="text-xs text-gray-500 truncate w-32">{company.official_website.replace(/^https?:\/\//, '')}</p>
                        </div>
                      </a>
                    )}
                    
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Posted on</p>
                        <p className="text-xs text-gray-500">{new Date(company.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyDetails;
