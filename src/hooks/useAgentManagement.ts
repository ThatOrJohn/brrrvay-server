
import { useAgentToken } from './useAgentToken';
import { useAgentQueries } from './useAgentQueries';
import { useAgentActions } from './useAgentActions';

export function useAgentManagement() {
  const tokenHook = useAgentToken();
  const queriesHook = useAgentQueries();
  const actionsHook = useAgentActions();

  return {
    // Token management
    loading: tokenHook.loading || actionsHook.loading,
    generateRegistrationToken: tokenHook.generateRegistrationToken,
    fetchRegistrationTokens: tokenHook.fetchRegistrationTokens,
    deleteRegistrationToken: tokenHook.deleteRegistrationToken,
    
    // Agent queries
    fetchAgents: queriesHook.fetchAgents,
    fetchStoreAgents: queriesHook.fetchStoreAgents,
    
    // Agent actions
    removeAgentFromStore: actionsHook.removeAgentFromStore,
    updateAgentConfig: actionsHook.updateAgentConfig,
  };
}
