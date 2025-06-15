
import React from 'react';
import OrganizationPageLayout from './OrganizationPageLayout';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { useOrganizationActions } from '@/hooks/useOrganizationActions';
import { useOrganizationPageState } from '@/hooks/useOrganizationPageState';
import { Organization, Concept, Store, User } from '@/types/admin';

interface OrganizationMainViewProps {
  orgId: string | null;
  conceptId: string | null;
  storeId: string | null;
}

export default function OrganizationMainView({
  orgId,
  conceptId,
  storeId,
}: OrganizationMainViewProps) {
  const {
    organizations,
    selectedOrg,
    concepts,
    selectedConcept,
    stores,
    users,
    error,
    conceptsPagination,
    storesPagination,
    setOrganizations,
    setConcepts,
    setStores,
    setConceptsPagination,
    setStoresPagination,
    fetchOrganizations,
    fetchConcepts,
    fetchStores,
    fetchUsers,
  } = useOrganizationData();

  // WRAPPER FETCH functions for useOrganizationActions (correct signature)
  const fetchConceptsWrapper = (orgIdToFetch: string) => {
    // always use latest pagination from state
    fetchConcepts(orgIdToFetch, conceptsPagination, setConceptsPagination, conceptId, storeId);
  };

  const fetchStoresWrapper = (conceptIdToFetch: string) => {
    fetchStores(conceptIdToFetch, storesPagination, setStoresPagination, storeId);
  };

  const fetchUsersWrapper = (orgIdToFetch: string) => {
    // If conceptId present, filter users by that concept
    fetchUsers(orgIdToFetch, conceptId || undefined);
  };

  const {
    handleToggleActive,
    handleEdit,
    handleAddUser,
    handleAddOrganization,
    handleAddConcept,
    handleAddStore,
  } = useOrganizationActions({
    selectedOrg,
    selectedConcept,
    onRefreshOrganizations: fetchOrganizations,
    onRefreshConcepts: fetchConceptsWrapper,
    onRefreshStores: fetchStoresWrapper,
    onRefreshUsers: fetchUsersWrapper,
  });

  const {
    editState,
    setEditState,
    newUser,
    newOrgName,
    setNewOrgName,
    newConceptName,
    setNewConceptName,
    newStoreName,
    setNewStoreName,
    newStoreExternalId,
    setNewStoreExternalId,
    handleNewUserChange,
    resetNewUser,
    resetEditState,
  } = useOrganizationPageState();

  const onAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddOrganization(newOrgName, organizations, setOrganizations);
    setNewOrgName('');
  };

  const onAddConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddConcept(newConceptName, concepts, setConcepts);
    setNewConceptName('');
  };

  const onAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddStore(newStoreName, newStoreExternalId, stores, setStores);
    setNewStoreName('');
    setNewStoreExternalId('');
  };

  const onAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orgId && conceptId) {
      await handleAddUser(newUser, orgId, conceptId);
      resetNewUser();
    }
  };

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

  return (
    <OrganizationPageLayout
      organizations={organizations}
      concepts={concepts}
      stores={stores}
      users={users}
      selectedOrg={selectedOrg}
      selectedConcept={selectedConcept}
      orgId={orgId}
      conceptId={conceptId}
      storeId={storeId}
      conceptsPagination={conceptsPagination}
      storesPagination={storesPagination}
      editState={editState}
      newOrgName={newOrgName}
      newConceptName={newConceptName}
      newStoreName={newStoreName}
      newStoreExternalId={newStoreExternalId}
      newUser={newUser}
      error={error}
      onNewOrgNameChange={setNewOrgName}
      onNewConceptNameChange={setNewConceptName}
      onNewStoreNameChange={setNewStoreName}
      onNewStoreExternalIdChange={setNewStoreExternalId}
      onNewUserChange={handleNewUserChange}
      onAddOrganization={onAddOrganization}
      onAddConcept={onAddConcept}
      onAddStore={onAddStore}
      onAddUser={onAddUser}
      onEditOrganization={(org: Organization) => setEditState({
        type: 'organization',
        id: org.id,
        data: { name: org.name }
      })}
      onEditConcept={(concept: Concept) => setEditState({
        type: 'concept',
        id: concept.id,
        data: { name: concept.name }
      })}
      onEditStore={(store: Store) => setEditState({
        type: 'store',
        id: store.id,
        data: {
          name: store.name,
          external_id: store.external_id || ''
        }
      })}
      onEditUser={(user: User) => setEditState({
        type: 'user',
        id: user.id,
        data: {
          email: user.email,
          name: user.name || ''
        }
      })}
      onConceptsPaginationChange={setConceptsPagination}
      onStoresPaginationChange={setStoresPagination}
      onEditStateChange={setEditState}
      onEdit={onEdit}
      onToggleActive={handleToggleActive}
      getCurrentEditItem={getCurrentEditItem}
    />
  );
}
