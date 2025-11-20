import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isAuthInitialized } = useSelector((state) => state.auth);
  
  console.log('🛡️ RoleBasedRoute - Check access');
  console.log('User:', user);
  console.log('Allowed roles:', allowedRoles);
  console.log('Is authenticated:', isAuthenticated);
  
  if (!isAuthInitialized) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // Normalize user role to uppercase for comparison
  const normalizedUserRole = user?.role?.toUpperCase().replace(/_/g, '');
  
  console.log('Normalized user role:', normalizedUserRole);
  
  // Normalize allowed roles to uppercase and remove underscores
  const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase().replace(/_/g, ''));
  
  console.log('Normalized allowed roles:', normalizedAllowedRoles);
  
  if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(normalizedUserRole)) {
    console.log('❌ Access denied - redirecting based on role');
    // Redirect based on user role if they don't have access
    switch(normalizedUserRole) {
      case "DRIVER":
        return <Navigate to="/driver" replace />;
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "STAFF":
      case "STATIONEMPLOYEE":
        return <Navigate to="/employee/dashboard" replace />;
      default:
        return <Navigate to="/auth/login" replace />;
    }
  }
  
  console.log('✅ Access granted - rendering children');
  return children;
};

export default RoleBasedRoute;