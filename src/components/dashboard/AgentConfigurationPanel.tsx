
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Monitor, Key } from 'lucide-react';

type UserStore = {
  id: string;
  name: string;
  concept_id: string;
  organization_id: string;
};

interface AgentConfigurationPanelProps {
  store: UserStore;
}

export default function AgentConfigurationPanel({ store }: AgentConfigurationPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Agent Configuration</h2>
          <p className="text-gray-400">Configure and manage security agents for {store.name}</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Register New Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registration Tokens */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Registration Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Generate tokens to register new agents for this store.
            </p>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
              Generate Token
            </Button>
          </CardContent>
        </Card>

        {/* Agent Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Agent Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Monitor the status of all registered agents.
            </p>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
              View Agents
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Registered Agents List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Registered Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No agents registered</p>
            <p className="text-sm">
              Register your first security agent to start monitoring this store.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
