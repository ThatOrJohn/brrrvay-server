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
}

export function useOrganizationActions({
  selectedOrg,
  selectedConcept,
  onRefreshOrganizations,
  onRefreshConcepts,
  onRefreshStores,
  onRefreshUsers,
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
          break;
        case 'concept':
          if (selectedOrg) {
            onRefreshConcepts(selectedOrg);
          }
          break;
        case 'store':
          if (selectedConcept) {
            onRefreshStores(selectedConcept);
          }
          break;
        case 'user':
          if (selectedOrg) {
            onRefreshUsers(selectedOrg);
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
    });
  };

  return {
    handleToggleActive,
    handleEdit,
    handleAddUser,
    handleAddOrganization,
    handleAddConcept,
    handleAddStore,
  };
}