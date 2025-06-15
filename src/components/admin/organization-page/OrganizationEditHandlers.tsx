
import { Organization, Concept, Store, User, EditState } from '@/types/admin';

interface OrganizationEditHandlersProps {
  organizations: Organization[];
  concepts: Concept[];
  stores: Store[];
  users: User[];
  editState: EditState;
  setEditState: (state: EditState) => void;
  resetEditState: () => void;
  handleEdit: (editState: EditState, orgs: Organization[], concepts: Concept[], stores: Store[], users: User[]) => Promise<void>;
}

export function useOrganizationEditHandlers({
  organizations,
  concepts,
  stores,
  users,
  editState,
  setEditState,
  resetEditState,
  handleEdit,
}: OrganizationEditHandlersProps) {
  const onEdit = async () => {
    await handleEdit(editState, organizations, concepts, stores, users);
    resetEditState();
  };

  const getCurrentEditItem = () => {
    if (!editState.type || !editState.id) return null;

    switch (editState.type) {
      case 'organization':
        return organizations.find(o => o.id === editState.id);
      case 'concept':
        return concepts.find(c => c.id === editState.id);
      case 'store':
        return stores.find(s => s.id === editState.id);
      case 'user':
        return users.find(u => u.id === editState.id);
      default:
        return null;
    }
  };

  const onEditOrganization = (org: Organization) => setEditState({
    type: 'organization',
    id: org.id,
    data: { name: org.name }
  });

  const onEditConcept = (concept: Concept) => setEditState({
    type: 'concept',
    id: concept.id,
    data: { name: concept.name }
  });

  const onEditStore = (store: Store) => setEditState({
    type: 'store',
    id: store.id,
    data: {
      name: store.name,
      external_id: store.external_id || ''
    }
  });

  const onEditUser = (user: User) => setEditState({
    type: 'user',
    id: user.id,
    data: {
      email: user.email,
      name: user.name || ''
    }
  });

  return {
    onEdit,
    getCurrentEditItem,
    onEditOrganization,
    onEditConcept,
    onEditStore,
    onEditUser,
  };
}
