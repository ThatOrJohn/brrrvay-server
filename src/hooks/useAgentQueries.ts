
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Agent, StoreAgent } from '@/types/agent';

export function useAgentQueries() {
  const { toast } = useToast();

  const fetchAgents = async (): Promise<Agent[]> => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      // Transform the data to match our Agent type
      const transformedData = (data || []).map(agent => ({
        ...agent,
        status: agent.status as Agent['status'],
        config: (agent.config as Record<string, any>) || {},
      }));
      
      return transformedData;
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
      
      // Transform the data to match our StoreAgent type
      const transformedData = (data || []).map(storeAgent => ({
        ...storeAgent,
        config: (storeAgent.config as Record<string, any>) || {},
        agent: storeAgent.agent ? {
          ...storeAgent.agent,
          status: storeAgent.agent.status as Agent['status'],
          config: (storeAgent.agent.config as Record<string, any>) || {},
        } : undefined,
      }));
      
      return transformedData;
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

  return {
    fetchAgents,
    fetchStoreAgents,
  };
}
