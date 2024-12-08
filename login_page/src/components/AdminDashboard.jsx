import React, { useState } from 'react';
import Table from './Table';
import ManageFields from './ManageFields';
import AddUserAdmin from './AddUserAdmin'; // Import the AddUserAdmin component
import './styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [formType, setFormType] = useState(''); // State to manage the form type

  const handleButtonClick = (type) => {
    setFormType(formType === type ? '' : type); // Toggle the form visibility based on button click
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="button-group">
        <button onClick={() => handleButtonClick('user')} className="primary-button">
          {formType === 'user' ? 'Close Add User' : 'Add User'}
        </button>
        <button onClick={() => handleButtonClick('admin')} className="primary-button">
          {formType === 'admin' ? 'Close Add Admin' : 'Add Admin'}
        </button>
        <button onClick={() => handleButtonClick('manageFields')} className="primary-button">
          {formType === 'manageFields' ? 'Close Manage Fields' : 'Manage Fields'}
        </button>
      </div>

      {/* Conditionally render the respective forms */}
      {formType === 'user' && (
        <div className="form-overlay">
          <AddUserAdmin formType="user" /> {/* Pass formType="user" */}
        </div>
      )}

      {formType === 'admin' && (
        <div className="form-overlay">
          <AddUserAdmin formType="admin" /> {/* Pass formType="admin" */}
        </div>
      )}

      {formType === 'manageFields' && (
        <div className="form-overlay">
          <ManageFields /> {/* Render ManageFields component */}
        </div>
      )}

      {/* Display Tables for Users and Admins */}
      <Table collectionName="users" />
      <Table collectionName="admins" />
    </div>
  );
};

export default AdminDashboard;
  