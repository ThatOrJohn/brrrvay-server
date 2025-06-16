import { EditState, NewUser } from '@/types/admin';
import { useEntityActions } from './useEntityActions';
import { useEntityEditor } from './useEntityEditor';
import { useOrganizationManagement } from './useOrganizationManagement';
import { useConceptManagement } from './useConceptManagement';
import { useStoreManagement } from './useStoreManagement';
import { useUserManagement } from './useUserManagement';

interface UseOrganizationActionsProps {
  selectedOrg: string | null;
  selectedConcept: string | null;
  onRefreshOrganizations: () => void;
  onRefreshConcepts: (orgId: string) => void;
  onRefreshStores: (conceptId: string) => void;
  onRefreshUsers: (orgId: string) => void;
  resetDataLoaded?: (keys: string[]) => void;
}

export function useOrganizationActions({
  selectedOrg,
  selectedConcept,
  onRefreshOrganizations,
  onRefreshConcepts,
  onRefreshStores,
  onRefreshUsers,
  resetDataLoaded,
}: UseOrganizationActionsProps) {
  const { handleToggleActive: baseToggleActive } = useEntityActions({
    onRefresh: () => {
      // This will be overridden by specific refresh functions
    }
  });

  const { handleEdit } = useEntityEditor({
    selectedOrg,
    selectedConcept,
    onRefreshOrganizations,
    onRefreshConcepts,
    onRefreshStores,
    onRefreshUsers,
  });

  const { handleAddOrganization } = useOrganizationManagement();
  const { handleAddConcept } = useConceptManagement(selectedOrg);
  const { handleAddStore } = useStoreManagement(selectedConcept);
  const { handleAddUser: baseHandleAddUser } = useUserManagement();

  const handleToggleActive = async (
    type: 'organization' | 'concept' | 'store' | 'user',
    id: string,
    currentStatus: boolean
  ) => {
    const tableName = type === 'organization' ? 'organizations' : 
                     type === 'concept' ? 'concepts' : 
                     type === 'store' ? 'stores' : 'users';

    const refreshFunction = () => {
      switch (type) {
        case 'organization':
          onRefreshOrganizations();
          resetDataLoaded?.(['organizations']);
          break;
        case 'concept':
          if (selectedOrg) {
            onRefreshConcepts(selectedOrg);
            resetDataLoaded?.(['concepts']);
          }
          break;
        case 'store':
          if (selectedConcept) {
            onRefreshStores(selectedConcept);
            resetDataLoaded?.(['stores']);
          }
          break;
        case 'user':
          if (selectedOrg) {
            onRefreshUsers(selectedOrg);
            resetDataLoaded?.(['users']);
          }
          break;
      }
    };

    await baseToggleActive(tableName, id, currentStatus, type);
    refreshFunction();
  };

  const handleAddUser = async (newUser: NewUser, orgId: string, conceptId: string) => {
    await baseHandleAddUser(newUser, orgId, conceptId, (orgIdToRefresh) => {
      onRefreshUsers(orgIdToRefresh);
      resetDataLoaded?.(['users']);
    });
  };

  const wrappedHandleAddOrganization = async (name: string, organizations: any[], setOrganizations: any) => {
    await handleAddOrganization(name, organizations, setOrganizations);
    resetDataLoaded?.(['organizations']);
  };

  const wrappedHandleAddConcept = async (name: string, concepts: any[], setConcepts: any) => {
    await handleAddConcept(name, concepts, setConcepts);
    resetDataLoaded?.(['concepts']);
  };

  const wrappedHandleAddStore = async (name: string, externalId: string, stores: any[], setStores: any) => {
    await handleAddStore(name, externalId, stores, setStores);
    resetDataLoaded?.(['stores']);
  };

  return {
    handleToggleActive,
    handleEdit,
    handleAddUser,
    handleAddOrganization: wrappedHandleAddOrganization,
    handleAddConcept: wrappedHandleAddConcept,
    handleAddStore: wrappedHandleAddStore,
  };
}