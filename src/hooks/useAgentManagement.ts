
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Agent, AgentRegistrationToken, StoreAgent, GenerateTokenRequest } from '@/types/agent';

export function useAgentManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateRegistrationToken = async (request: GenerateTokenRequest) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `https://wpmvjrjtyxivfzpaveju.supabase.co/functions/v1/generate-agent-token`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate token');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: `Registration token generated: ${result.token}`,
      });

      return result;
    } catch (error) {
      console.error('Error generating token:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate registration token',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async (): Promise<Agent[]> => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error",
        description: 'Failed to fetch agents',
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchStoreAgents = async (storeId: string): Promise<StoreAgent[]> => {
    try {
      const { data, error } = await supabase
        .from('store_agents')
        .select(`
          *,
          agent:agents(*),
          store:stores(id, name)
        `)
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching store agents:', error);
      toast({
        title: "Error",
        description: 'Failed to fetch store agents',
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchRegistrationTokens = async (storeId?: string): Promise<AgentRegistrationToken[]> => {
    try {
      let query = supabase
        .from('agent_registration_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching registration tokens:', error);
      toast({
        title: "Error",
        description: 'Failed to fetch registration tokens',
        variant: "destructive",
      });
      return [];
    }
  };

  const removeAgentFromStore = async (storeAgentId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('store_agents')
        .update({ is_active: false })
        .eq('id', storeAgentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Agent removed from store",
      });
    } catch (error) {
      console.error('Error removing agent from store:', error);
      toast({
        title: "Error",
        description: 'Failed to remove agent from store',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAgentConfig = async (agentId: string, config: Record<string, any>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({ config })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Agent configuration updated",
      });
    } catch (error) {
      console.error('Error updating agent config:', error);
      toast({
        title: "Error",
        description: 'Failed to update agent configuration',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateRegistrationToken,
    fetchAgents,
    fetchStoreAgents,
    fetchRegistrationTokens,
    removeAgentFromStore,
    updateAgentConfig,
  };
}
