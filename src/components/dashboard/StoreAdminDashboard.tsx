
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Shield, Settings, Users } from 'lucide-react';
import StoreUserDashboard from './StoreUserDashboard';
import AgentConfigurationPanel from './AgentConfigurationPanel';

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

interface StoreAdminDashboardProps {
  store: UserStore;
  user: CurrentUser;
}

export default function StoreAdminDashboard({ store, user }: StoreAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Store Administration - {store.name}
          </h1>
          <p className="text-gray-400">
            Manage alerts, configure agents, and oversee store security operations.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400"
          >
            <Users className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="agents" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400"
          >
            <Settings className="w-4 h-4 mr-2" />
            Agent Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Admin Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Total Agents
                </CardTitle>
                <Shield className="h-4 w-4 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-400">-</div>
                <p className="text-xs text-gray-500">
                  Registered agents
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Active Agents
                </CardTitle>
                <Shield className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">-</div>
                <p className="text-xs text-gray-500">
                  Currently online
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Today's Alerts
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">0</div>
                <p className="text-xs text-gray-500">
                  Alerts generated today
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Your Role
                </CardTitle>
                <Users className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">Admin</div>
                <p className="text-xs text-gray-500">
                  Full management access
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Include the regular store user dashboard content */}
          <StoreUserDashboard store={store} user={user} />
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
          <AgentConfigurationPanel store={store} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
