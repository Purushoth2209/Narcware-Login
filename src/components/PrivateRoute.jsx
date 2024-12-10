import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isAuthenticated) {
    // Clear any sensitive history when not authenticated
    window.history.replaceState(null, '', location.pathname);

    if (location.pathname.startsWith('/admin-dashboard')) {
      return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
