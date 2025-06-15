import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAgentManagement } from '@/hooks/useAgentManagement';
import { Agent, AgentRegistrationToken, StoreAgent } from '@/types/agent';
import { 
  Monitor, 
  Plus, 
  Copy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AgentManagementProps {
  storeId: string;
  storeName: string;
}

export default function AgentManagement({ storeId, storeName }: AgentManagementProps) {
  const { toast } = useToast();
  const {
    loading,
    generateRegistrationToken,
    fetchStoreAgents,
    fetchRegistrationTokens,
    removeAgentFromStore,
  } = useAgentManagement();

  const [storeAgents, setStoreAgents] = useState<StoreAgent[]>([]);
  const [registrationTokens, setRegistrationTokens] = useState<AgentRegistrationToken[]>([]);
  const [expirationMinutes, setExpirationMinutes] = useState(15);

  useEffect(() => {
    loadData();
  }, [storeId]);

  const loadData = async () => {
    const [agents, tokens] = await Promise.all([
      fetchStoreAgents(storeId),
      fetchRegistrationTokens(storeId),
    ]);
    setStoreAgents(agents);
    setRegistrationTokens(tokens);
  };

  const handleGenerateToken = async () => {
    try {
      await generateRegistrationToken({
        store_id: storeId,
        expires_in_minutes: expirationMinutes,
      });
      loadData(); // Refresh tokens list
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
      title: "Copied",
      description: "Registration token copied to clipboard",
    });
  };

  const handleRemoveAgent = async (storeAgentId: string) => {
    try {
      await removeAgentFromStore(storeAgentId);
      loadData(); // Refresh agents list
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'maintenance':
        return <Settings className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'offline':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const isTokenUsed = (token: AgentRegistrationToken) => {
    return !!token.used_at;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Agent Management</h2>
        <p className="text-gray-400">Store: {storeName}</p>
      </div>

      {/* Generate Registration Token */}
      <Card className="bg-[#1A1A1A] border-[#333333]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate Registration Token
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expiration (minutes)
              </label>
              <Input
                type="number"
                value={expirationMinutes}
                onChange={(e) => setExpirationMinutes(parseInt(e.target.value) || 15)}
                min={1}
                max={1440}
                className="bg-[#2A2A2A] border-[#333333] text-white"
              />
            </div>
            <Button
              onClick={handleGenerateToken}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Generate Token
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Registration Tokens */}
      <Card className="bg-[#1A1A1A] border-[#333333]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Registration Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrationTokens.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No registration tokens found</p>
          ) : (
            <div className="space-y-3">
              {registrationTokens.map((token) => (
                <div
                  key={token.id}
                  className={`p-4 rounded-lg border ${
                    isTokenUsed(token) || isTokenExpired(token.expires_at)
                      ? 'bg-gray-500/10 border-gray-500/30'
                      : 'bg-indigo-500/10 border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-mono text-white bg-[#2A2A2A] px-3 py-1 rounded">
                        {token.token}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyToken(token.token)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTokenUsed(token) ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Used
                        </Badge>
                      ) : isTokenExpired(token.expires_at) ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          Expired
                        </Badge>
                      ) : (
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    <p>Created: {new Date(token.created_at).toLocaleString()}</p>
                    <p>Expires: {new Date(token.expires_at).toLocaleString()}</p>
                    {token.used_at && (
                      <p>Used: {new Date(token.used_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Agents */}
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
                      {getStatusIcon(storeAgent.agent?.status || 'offline')}
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
                      <Badge className={getStatusColor(storeAgent.agent?.status || 'offline')}>
                        {storeAgent.agent?.status || 'offline'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveAgent(storeAgent.id)}
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
    </div>
  );
}