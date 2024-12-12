import React, { useState } from 'react';
import { signOut } from 'firebase/auth'; // Import signOut from Firebase
import { auth } from '../firebase'; // Import the Firebase auth instance
import Table from './AdminTable';
import ManageFields from './ManageFields';
import AddUserAdmin from './AddUserAdmin'; // Import the AddUserAdmin component
import './styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [formType, setFormType] = useState(''); // State to manage the form type

  // Function to close the form
  const closeForm = () => {
    setFormType(''); // Reset formType to close any open form
  };

  const handleButtonClick = (type) => {
    setFormType(formType === type ? '' : type); // Toggle the form visibility based on button click
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user from Firebase
      console.log('User logged out');
      // Redirect to the admin-login page with the correct base URL
      window.location.href = '/Narcware-Login/admin-login';
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <header className='admin-dashboard-header'>
        <h1 className="dashboard-title">Admin Dashboard</h1>
      </header>

      {/* Logout Button */}
      <div className="logout-container">
        <button onClick={handleLogout} className="ad-logout-button">
          Logout
        </button>
      </div>

      <div className="button-group">
        <button onClick={() => handleButtonClick('user')} className="primary-button">
          {formType === 'user' ? 'Close Add User' : 'Add User'}
        </button>
        <button onClick={() => handleButtonClick('admin')} className="primary-button">
          {formType === 'admin' ? 'Close Add Admin' : 'Add Admin'}
        </button>
      </div>

      {/* Conditionally render the respective forms */}
      {formType === 'user' && (
        <div className="form-overlay">
          <AddUserAdmin formType="user" closeForm={closeForm} />
        </div>
      )}

      {formType === 'admin' && (
        <div className="form-overlay">
          <AddUserAdmin formType="admin" closeForm={closeForm} />
        </div>
      )}

      {/* Display Tables for Users and Admins */}
      <Table collectionName="users" />
      <Table collectionName="admins" />
    </div>
  );
};

export default AdminDashboard;