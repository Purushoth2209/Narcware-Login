// DashboardPage.js
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Import Firebase auth instance
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User logged out successfully');
        navigate('/login'); // Redirect to login page after logout
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default DashboardPage;
