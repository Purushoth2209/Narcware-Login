import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase'; // Import Firebase auth instance
import { onAuthStateChanged } from 'firebase/auth';

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true); // To manage loading state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // To get the current location (the page the user is trying to access)
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true); // User is authenticated
      } else {
        setIsAuthenticated(false); // User is not authenticated
      }
      setLoading(false); // Once the auth state is determined, stop loading
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading state while checking auth
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to login page with the attempted URL
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children; // If authenticated, allow the protected route to render
};

export default PrivateRoute;
