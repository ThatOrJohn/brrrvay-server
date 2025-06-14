
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Activity, 
  Monitor, 
  Clock, 
  BarChart, 
  Settings,
  Plus,
  Users,
  Timer,
  Cog
} from 'lucide-react';

export default function AdminDashboard() {
  const { stats, loading, error } = useDashboardStats();
  const navigate = useNavigate();

  const handleAddOrganization = () => {
    navigate('/admin/organizations');
  };

  const handleViewAllUsers = () => {
    navigate('/admin/search');
  };

  const handleManageTrials = () => {
    // Navigate to organizations page where trials can be managed
    navigate('/admin/organizations');
  };

  const handleSystemSettings = () => {
    // For now, navigate to dashboard - could be expanded later
    navigate('/admin/dashboard');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading dashboard: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your platform</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Organizations"
          value={stats.totalOrganizations}
          icon={Database}
          description={`${stats.activeOrganizations} active`}
          color="blue"
        />
        
        <StatCard
          title="Active Trials"
          value={stats.activeTrials}
          icon={Clock}
          description="Current trial subscriptions"
          color="green"
        />
        
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Activity}
          description="Across all organizations"
          color="purple"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Active Organizations"
          value={stats.activeOrganizations}
          icon={Monitor}
          description="Currently operational"
          color="indigo"
        />
        
        <StatCard
          title="Total Concepts"
          value={stats.totalConcepts}
          icon={BarChart}
          description="Business concepts created"
          color="green"
        />
        
        <StatCard
          title="Total Stores"
          value={stats.totalStores}
          icon={Settings}
          description="Store locations managed"
          color="purple"
        />
      </div>

      {/* Quick Actions Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleAddOrganization}
              className="flex items-center gap-2"
              variant="default"
            >
              <Plus className="w-4 h-4" />
              Add Organization
            </Button>
            
            <Button 
              onClick={handleViewAllUsers}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Users className="w-4 h-4" />
              View All Users
            </Button>
            
            <Button 
              onClick={handleManageTrials}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Timer className="w-4 h-4" />
              Manage Trials
            </Button>
            
            <Button 
              onClick={handleSystemSettings}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Cog className="w-4 h-4" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
