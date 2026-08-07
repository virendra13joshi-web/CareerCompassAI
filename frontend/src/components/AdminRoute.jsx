import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// AdminRoute protects admin-only routes
const AdminRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Not logged in – redirect to login
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    // Logged in but not admin – redirect to normal dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized – render child routes
  return <Outlet />;
};

export default AdminRoute;
