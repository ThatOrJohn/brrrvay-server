
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AgentRegistrationToken, GenerateTokenRequest } from '@/types/agent';

export function useAgentToken() {
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

  return {
    loading,
    generateRegistrationToken,
    fetchRegistrationTokens,
  };
}
