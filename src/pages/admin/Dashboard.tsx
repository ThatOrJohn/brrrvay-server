
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Store, UserCheck, Key } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import PasswordChangeModal from '@/components/auth/PasswordChangeModal';
import ImpersonationModal from '@/components/admin/ImpersonationModal';

export default function AdminDashboard() {
  const { stats, loading } = useDashboardStats();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showImpersonationModal, setShowImpersonationModal] = useState(false);

  // Get current internal user from auth session
  const currentUserId = 'temp-user-id'; // This should come from auth context

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Monitor and manage your organizations, stores, and users
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowPasswordModal(true)}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Key className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button
            onClick={() => setShowImpersonationModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Impersonate User
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Organizations"
          value={loading ? 'Loading...' : stats.totalOrganizations}
          icon={Building2}
          description="Active organizations"
          color="blue"
        />
        <StatCard
          title="Total Stores"
          value={loading ? 'Loading...' : stats.totalStores}
          icon={Store}
          description="Across all organizations"
          color="green"
        />
        <StatCard
          title="External Users"
          value={loading ? 'Loading...' : stats.totalUsers}
          icon={Users}
          description="Registered external users"
          color="purple"
        />
        <StatCard
          title="Active Trials"
          value={loading ? 'Loading...' : stats.activeTrials}
          icon={Settings}
          description="Current active trials"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Manage organizations, concepts, and stores
            </p>
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => window.location.href = '/admin/organizations'}
            >
              Manage Organizations
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Manage external users and their permissions
            </p>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => window.location.href = '/admin/organizations'}
            >
              Manage Users
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userId={currentUserId}
        isExternalUser={false}
      />

      <ImpersonationModal
        isOpen={showImpersonationModal}
        onClose={() => setShowImpersonationModal(false)}
        currentInternalUserId={currentUserId}
      />
    </div>
  );
}
