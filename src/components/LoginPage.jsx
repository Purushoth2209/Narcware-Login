import React, { useState, useEffect } from 'react';
import { auth } from '../firebase'; // Import Firebase auth instance
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore methods
import './styles/LoginPage.css'; // Import the CSS file

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // State to store error message
  const [isLoading, setIsLoading] = useState(false); // Loading state for login process
  const navigate = useNavigate(); // Initialize useNavigate
  const [isPageLoading, setIsPageLoading] = useState(true); // Loading state for the page spinner
  const db = getFirestore(); // Initialize Firestore

  // Simulate a 2-second delay for the page loading spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false); // After 2 seconds, hide the spinner and show the login form
    }, 1000); // 1000ms = 1 second
    return () => clearTimeout(timer); // Clear the timer on component unmount
  }, []);

  // Sign out the user whenever the Login page is visited
  useEffect(() => {
    // Log out the user if they visit the Login Page
    const logOutUser = async () => {
      try {
        await signOut(auth); // Sign out user
        console.log('User logged out automatically');
      } catch (error) {
        console.error('Error logging out user: ', error.message);
      }
    };
    logOutUser(); // Execute sign out when this component mounts
  }, []);

  // Forgot password functionality
  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage("Please enter your email to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setErrorMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setErrorMessage("Error sending password reset email. Please try again."+error);
    }
  };

  // Form validation function
  const validateForm = () => {
    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex validation
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    return true;
  };

  // Check if email exists in Firestore
  const checkEmailInFirestore = async (email) => {
    try {
      const usersRef = collection(db, 'users'); // Access the 'users' collection
      const q = query(usersRef, where('email', '==', email)); // Query for the email field
      const querySnapshot = await getDocs(q); // Get documents matching the query
      return !querySnapshot.empty; // Return true if the email exists, false otherwise
    } catch (error) {
      console.error('Error checking email in Firestore: ', error.message);
      setErrorMessage('Error checking email. Please try again later.');
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true); // Show loading during login

    // Validate form
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    // Check if email exists in Firestore
    const emailExists = await checkEmailInFirestore(email);
    if (!emailExists) {
      setErrorMessage('Email not found in our system. Please check your email.');
      setIsLoading(false);
      return;
    }

    try {
      // Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully');

      // Redirect to Narcware Dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error.message);
      setErrorMessage('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="admin-login-page-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="user-login-page-container">
      <header className="user-login-header">
        <h1 className="header-title">Welcome to NARCWARE</h1>
        <p className="header-subtitle">Login to access NARCWARE</p>
      </header>

      <div className="user-login-box">
        <h1 className="user-login-title">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="user-input-group">
            <label htmlFor="email" className="user-label">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="user-input"
            />
          </div>
          <div className="user-input-group">
            <label htmlFor="password" className="user-label">Password</label>
            <div className="user-password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="user-input"
              />
              <span
                className="user-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </span>
            </div>
          </div>
          <button type="submit" className="user-login-button" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        {/* Show error message if login fails */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {/* Show loading spinner */}
        {isLoading && <div className="form-loading-spinner"></div>}

        {/* Forgot password link */}
        <div className="forgot-password-link">
          <span className="user-login-forgotPassword" onClick={handleForgotPassword}>Forgot Password?</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
