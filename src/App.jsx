import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';  // MainPage Component
import LoginPage from './components/LoginPage';  // User Login Page Component
import AdminLoginPage from './components/AdminLoginPage';  // Admin Login Page Component
import DashboardPage from './components/Dashboard';  // Dashboard Page Component
import AdminDashboardPage from './components/AdminDashboard';  // Admin Dashboard Page Component
import PrivateRoute from './components/PrivateRoute';  // Import PrivateRoute Component

const App = () => {
  return (
    <Router basename="/Narcware-Login"> {/* Set the basename in App.jsx */}
      <Routes>
        <Route path="/" element={<MainPage />} /> {/* MainPage is the default route */}
        <Route path="/login" element={<LoginPage />} /> {/* User Login Page */}
        <Route path="/admin-login" element={<AdminLoginPage />} /> {/* Admin Login Page */}
        
        {/* Protecting the Admin Dashboard route with PrivateRoute */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute>
              <AdminDashboardPage /> {/* Admin Dashboard will only render if authenticated */}
            </PrivateRoute>
          }
        />
        
        {/* Protecting the User Dashboard route with PrivateRoute */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage /> {/* This will only render if the user is authenticated */}
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
