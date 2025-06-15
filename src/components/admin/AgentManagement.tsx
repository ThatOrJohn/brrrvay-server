
import React, { useState, useEffect } from 'react';
import { useAgentManagement } from '@/hooks/useAgentManagement';
import { AgentRegistrationToken, StoreAgent } from '@/types/agent';
import { useToast } from '@/hooks/use-toast';
import RegistrationTokenGenerator from './agent-management/RegistrationTokenGenerator';
import RegistrationTokensList from './agent-management/RegistrationTokensList';
import AssignedAgentsList from './agent-management/AssignedAgentsList';

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

  const handleGenerateToken = async (expirationMinutes: number) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Agent Management</h2>
        <p className="text-gray-400">Store: {storeName}</p>
      </div>

      <RegistrationTokenGenerator
        onGenerateToken={handleGenerateToken}
        loading={loading}
      />

      <RegistrationTokensList
        tokens={registrationTokens}
        onCopyToken={handleCopyToken}
      />

      <AssignedAgentsList
        storeAgents={storeAgents}
        onRemoveAgent={handleRemoveAgent}
      />
    </div>
  );
}
