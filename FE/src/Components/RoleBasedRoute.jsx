import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isAuthInitialized } = useSelector((state) => state.auth);
  
  if (!isAuthInitialized) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role if they don't have access
    switch(user?.role) {
      case "Driver":
        return <Navigate to="/driver" replace />;
      case "Admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "Enterprise":
        return <Navigate to="/enterprise/dashboard" replace />;
      case "Staff":
      case "StationEmployee":
        return <Navigate to="/staff/dashboard" replace />;
      default:
        return <Navigate to="/auth/login" replace />;
    }
  }
  
  return children;
};

export default RoleBasedRoute;