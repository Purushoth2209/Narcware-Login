import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/MainPage.css';

const MainPage = () => {
  const navigate = useNavigate();

  const handleUserLogin = () => {
    navigate('/login'); // Redirect to the user login page
  };

  const handleAdminLogin = () => {
    navigate('/admin-login'); // Redirect to the admin login page
  };

  return (
    <div className="main-page-wrapper">
      <div className="main-page">
        <header className="main-header">
          <h1 className="app-title">Welcome to Narcware</h1>
          <div className="login-links">
            <span className="login-link" onClick={handleUserLogin}>
              User Login
            </span>
            <span className="login-link" onClick={handleAdminLogin}>
              Admin Login
            </span>
          </div>
        </header>
        <main className="main-content">
          <p className="app-description">
            Narcware is a secure platform designed for narcotic officials to manage narcotics-related information. It
            provides an easy way to login for both admins and narcotic officials to access and manage sensitive data.
          </p>
          <section className="app-features">
            <h2>Features:</h2>
            <ul>
              <li>Secure login for users and admins</li>
              <li>Manage sensitive narcotics-related data</li>
              <li>Admin dashboard for user management</li>
              <li>Easy access for narcotic officials</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};

export default MainPage;
