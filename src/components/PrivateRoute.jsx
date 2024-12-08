import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types'; // Import PropTypes
import { auth } from '../firebase'; // Import Firebase auth instance
import { onAuthStateChanged } from 'firebase/auth';

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true); // To manage loading state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null); // To manage error state

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
    }, (err) => {
      setError(err.message); // Handle errors from Firebase authentication
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading state while checking auth
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error message if there's an issue
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to login page with the attempted URL
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children; // If authenticated, allow the protected route to render
};

// PropTypes validation for the PrivateRoute component
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired, // Ensure children is passed and is a valid React node
};

export default PrivateRoute;
