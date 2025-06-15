
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import SearchPage from './pages/admin/SearchPage';
import OrganizationsPage from './pages/admin/OrganizationsPage';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LoginPage />} />
        </Route>

        {/* External user dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="organizations/:orgId" element={<OrganizationsPage />} />
          <Route path="organizations/:orgId/concepts/:conceptId" element={<OrganizationsPage />} />
          <Route path="organizations/:orgId/concepts/:conceptId/stores/:storeId" element={<OrganizationsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
