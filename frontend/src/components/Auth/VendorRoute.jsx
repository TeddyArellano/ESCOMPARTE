import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * A wrapper component for routes that should only be accessible to vendors.
 * If the user is not authenticated or is not a vendor, they will be redirected to the login page
 * or a permission denied page.
 */
const VendorRoute = () => {
  const { isAuthenticated, isVendor } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login page with the current location
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname, message: 'Debe iniciar sesión para acceder a esta página' }} />;
  }

  // If authenticated but not a vendor, redirect to the permission denied page
  if (!isVendor()) {
    return <Navigate to="/acceso-denegado" state={{ error: 'No tiene permisos para acceder a esta página. Se requiere rol de vendedor.' }} />;
  }

  // User is authenticated and is a vendor, render the child routes
  return <Outlet />;
};

export default VendorRoute;
