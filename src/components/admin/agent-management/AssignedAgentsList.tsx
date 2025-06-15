
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Trash2 } from 'lucide-react';
import { StoreAgent } from '@/types/agent';
import AgentStatusBadge from './AgentStatusBadge';

interface AssignedAgentsListProps {
  storeAgents: StoreAgent[];
  onRemoveAgent: (storeAgentId: string) => Promise<void>;
}

export default function AssignedAgentsList({ 
  storeAgents, 
  onRemoveAgent 
}: AssignedAgentsListProps) {
  return (
    <Card className="bg-[#1A1A1A] border-[#333333]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Assigned Agents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {storeAgents.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No agents assigned to this store</p>
        ) : (
          <div className="space-y-3">
            {storeAgents.map((storeAgent) => (
              <div
                key={storeAgent.id}
                className="p-4 rounded-lg border border-[#333333] bg-[#2A2A2A]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-white font-medium">
                        {storeAgent.agent?.name || 'Unknown Agent'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Key: {storeAgent.agent?.agent_key}
                      </p>
                      {storeAgent.agent?.description && (
                        <p className="text-sm text-gray-400">
                          {storeAgent.agent.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AgentStatusBadge status={storeAgent.agent?.status || 'offline'} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveAgent(storeAgent.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-400">
                  <p>Assigned: {new Date(storeAgent.assigned_at).toLocaleString()}</p>
                  {storeAgent.agent?.last_seen_at && (
                    <p>Last seen: {new Date(storeAgent.agent.last_seen_at).toLocaleString()}</p>
                  )}
                  {storeAgent.agent?.version && (
                    <p>Version: {storeAgent.agent.version}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
