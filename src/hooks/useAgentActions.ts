
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAgentActions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
    removeAgentFromStore,
    updateAgentConfig,
  };
}
