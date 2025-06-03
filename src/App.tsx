import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import SearchPage from './pages/admin/SearchPage';
import AdminLayout from './layouts/AdminLayout';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="search" element={<SearchPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}