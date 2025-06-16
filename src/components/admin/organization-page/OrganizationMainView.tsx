import React from 'react';
import OrganizationPageLayout from './OrganizationPageLayout';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { useOrganizationActions } from '@/hooks/useOrganizationActions';
import { useOrganizationPageState } from '@/hooks/useOrganizationPageState';
import { useOrganizationDataEffects } from './OrganizationDataEffects';
import { useOrganizationFormHandlers } from './OrganizationFormHandlers';
import { useOrganizationEditHandlers } from './OrganizationEditHandlers';

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
    forceRefresh,
  } = useOrganizationData();

  // WRAPPER FETCH functions for useOrganizationActions (correct signature)
  const fetchConceptsWrapper = (orgIdToFetch: string) => {
    forceRefresh(['concepts']);
    fetchConcepts(orgIdToFetch, conceptsPagination, setConceptsPagination, conceptId, storeId);
  };

  const fetchStoresWrapper = (conceptIdToFetch: string) => {
    forceRefresh(['stores']);
    fetchStores(conceptIdToFetch, storesPagination, setStoresPagination, storeId);
  };

  const fetchUsersWrapper = (orgIdToFetch: string) => {
    forceRefresh(['users']);
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
    onRefreshOrganizations: () => {
      forceRefresh(['organizations']);
      fetchOrganizations();
    },
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

  // Use data effects hook
  useOrganizationDataEffects({
    orgId,
    conceptId,
    storeId,
    concepts,
    stores,
    conceptsPagination,
    storesPagination,
    fetchConcepts,
    fetchStores,
    fetchUsers,
    setConceptsPagination,
    setStoresPagination,
  });

  // Use form handlers hook
  const {
    onAddOrganization,
    onAddConcept,
    onAddStore,
    onAddUser,
  } = useOrganizationFormHandlers({
    newOrgName,
    newConceptName,
    newStoreName,
    newStoreExternalId,
    newUser,
    orgId,
    conceptId,
    organizations,
    concepts,
    stores,
    setNewOrgName,
    setNewConceptName,
    setNewStoreName,
    setNewStoreExternalId,
    resetNewUser,
    handleAddOrganization,
    handleAddConcept,
    handleAddStore,
    handleAddUser,
    setOrganizations,
    setConcepts,
    setStores,
  });

  // Use edit handlers hook
  const {
    onEdit,
    getCurrentEditItem,
    onEditOrganization,
    onEditConcept,
    onEditStore,
    onEditUser,
  } = useOrganizationEditHandlers({
    organizations,
    concepts,
    stores,
    users,
    editState,
    setEditState,
    resetEditState,
    handleEdit,
  });
  
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
      onEditOrganization={onEditOrganization}
      onEditConcept={onEditConcept}
      onEditStore={onEditStore}
      onEditUser={onEditUser}
      onConceptsPaginationChange={setConceptsPagination}
      onStoresPaginationChange={setStoresPagination}
      onEditStateChange={setEditState}
      onEdit={onEdit}
      onToggleActive={handleToggleActive}
      getCurrentEditItem={getCurrentEditItem}
    />
  );
}