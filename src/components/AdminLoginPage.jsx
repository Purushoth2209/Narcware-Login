import React, { useState, useEffect } from 'react';
import { auth } from '../firebase'; // Import Firebase auth instance
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'; // Import Firestore functions
import './styles/AdminLoginPage.css'; // Import the CSS file

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // State to store error message
  const [isLoading, setIsLoading] = useState(false); // Loading state for login process
  const [isPageLoading, setIsPageLoading] = useState(true); // Loading state for the page spinner
  const navigate = useNavigate(); // Initialize useNavigate
  const db = getFirestore(); // Initialize Firestore database

  // Simulate a 2-second delay for the page loading spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false); // After 2 seconds, hide the spinner and show the login form
    }, 1000); // 1000ms = 1 second
    return () => clearTimeout(timer); // Clear the timer on component unmount
  }, []);

  // Sign out the user whenever the Login page is visited
  useEffect(() => {
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
      setErrorMessage("Error sending password reset email. Please try again."+error );
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

  // Function to check if email exists in Firestore admins collection
  const checkIfEmailExistsInAdmins = async (email) => {
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('email', '==', email)); // Query to check if email exists
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Return true if email exists, otherwise false
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

    // Check if the email exists in Firestore admins collection
    const emailExists = await checkIfEmailExistsInAdmins(email);
    if (!emailExists) {
      setErrorMessage('This email is not associated with an admin account.');
      setIsLoading(false);
      return;
    }

    try {
      // Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Admin logged in successfully');
      
      // Redirect to Narcware Admin Dashboard after successful login
      navigate('/admin-dashboard');  // Updated to navigate to /admin-dashboard    
    } catch (error) {
      console.error('Error logging in:', error);

      // Handling Firebase Authentication error responses
      if (error.code === 'auth/invalid-email') {
        setErrorMessage('The email address is not valid.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('No user found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password. Please try again.');
      } else {
        setErrorMessage('Error logging in. Please try again later.');
      }
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
    <div className="admin-login-page-container">
      <header className="admin-login-header">
        <h1 className="header-title">Welcome to NARCWARE</h1>
        <p className="header-subtitle">Admin Login</p>
      </header>
      
      <div className="admin-login-box">
        <h1 className="admin-login-title">Admin Login</h1>
        <form onSubmit={handleLogin}>
          <div className="admin-input-group">
            <label htmlFor="email" className="admin-label">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="admin-input"
            />
          </div>
          <div className="admin-input-group">
            <label htmlFor="password" className="admin-label">Password</label>
            <div className="admin-password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="admin-input"
              />
              <span
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </span>
            </div>
          </div>
          <button type="submit" className="admin-login-button" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        
        {/* Show error message if login fails */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        
        {/* Show loading spinner */}
        {isLoading && <div className="form-loading-spinner"></div>}
        
        {/* Forgot password link */}
        <div className="forgot-password-link">
          <span className="admin-login-forgotPassword" onClick={handleForgotPassword}>Forgot Password?</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
