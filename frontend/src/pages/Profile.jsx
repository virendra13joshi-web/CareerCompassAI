import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ ...user });
  const [resumeFile, setResumeFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // When user context updates, sync form
  useEffect(() => {
    if (user) setFormData({ ...user });
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'resume') {
      setResumeFile(e.target.files[0]);
    } else if (e.target.name === 'profile_picture') {
      setProfilePicFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const submitData = new FormData();
    // Append standard fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && key !== 'resume_url' && key !== 'profile_picture_url') {
        submitData.append(key, formData[key]);
      }
    });

    // Append files
    if (resumeFile) submitData.append('resume', resumeFile);
    if (profilePicFile) submitData.append('profile_picture', profilePicFile);

    try {
      const res = await api.put('/auth/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(res.data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const profilePicUrl = user?.profile_picture_url 
    ? `http://localhost:5000${user.profile_picture_url}` 
    : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary to-indigo-600 h-32 sm:h-48 relative">
          <div className="absolute -bottom-12 sm:-bottom-16 left-8">
            <img 
              src={profilePicUrl} 
              alt="Profile" 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover shadow-lg bg-white"
            />
          </div>
        </div>

        <div className="pt-16 sm:pt-20 px-8 pb-8">
          <h1 className="text-3xl font-bold text-gray-900">{user?.full_name}</h1>
          <p className="text-gray-500 font-medium">{user?.email}</p>

          {message && (
            <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
              <p className="text-sm">{message}</p>
            </div>
          )}
          {error && (
            <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" name="full_name" value={formData.full_name || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="text" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
              </div>

              {/* Academic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Academic Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">College</label>
                  <input type="text" name="college" value={formData.college || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <input type="text" name="branch" value={formData.branch || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Semester</label>
                    <input type="number" name="semester" value={formData.semester || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CGPA</label>
                  <input type="number" step="0.01" name="cgpa" value={formData.cgpa || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
              </div>

              {/* Professional Links */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Professional Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                  <input type="text" name="skills" value={formData.skills || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                    <input type="url" name="linkedin" value={formData.linkedin || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
                    <input type="url" name="github" value={formData.github || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                  </div>
                </div>
              </div>

              {/* Uploads */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Documents & Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700">Update Profile Picture</label>
                    <input type="file" name="profile_picture" accept="image/*" onChange={handleFileChange} className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-primary hover:file:bg-indigo-100" />
                  </div>
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700">Upload Resume (PDF/Word)</label>
                    <input type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-primary hover:file:bg-indigo-100" />
                    {user?.resume_url && (
                      <a href={`http://localhost:5000${user.resume_url}`} target="_blank" rel="noreferrer" className="text-xs text-secondary mt-2 inline-block hover:underline">View Current Resume</a>
                    )}
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-5 border-t">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
