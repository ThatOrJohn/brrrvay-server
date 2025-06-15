
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Shield, Users } from 'lucide-react';

type UserStore = {
  id: string;
  name: string;
  concept_id: string;
  organization_id: string;
};

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
};

interface StoreUserDashboardProps {
  store: UserStore;
  user: CurrentUser;
}

export default function StoreUserDashboard({ store, user }: StoreUserDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to {store.name}
          </h1>
          <p className="text-gray-400">
            Stay informed about important alerts and updates from your store's security agents.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Alert Status Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Alert Status
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">All Clear</div>
            <p className="text-xs text-gray-500">
              No active alerts at this time
            </p>
          </CardContent>
        </Card>

        {/* Agent Status Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Agents Online
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">-</div>
            <p className="text-xs text-gray-500">
              Agent status will appear here
            </p>
          </CardContent>
        </Card>

        {/* User Info Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Your Access
            </CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">Store User</div>
            <p className="text-xs text-gray-500">
              View alerts and updates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Feed - Placeholder */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No alerts to display</p>
            <p className="text-sm">
              When your store's agents detect something important, you'll see it here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
