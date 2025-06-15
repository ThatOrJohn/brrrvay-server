
import React, { useEffect, useRef } from 'react';
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
    fetchConcepts(orgIdToFetch, conceptsPagination, setConceptsPagination, conceptId, storeId);
  };

  const fetchStoresWrapper = (conceptIdToFetch: string) => {
    fetchStores(conceptIdToFetch, storesPagination, setStoresPagination, storeId);
  };

  const fetchUsersWrapper = (orgIdToFetch: string) => {
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

  // Use refs to track previous values and prevent infinite loops
  const prevOrgIdRef = useRef<string | null>(null);
  const prevConceptIdRef = useRef<string | null>(null);
  const hasConceptsRef = useRef(false);
  const hasStoresRef = useRef(false);

  // Only fetch concepts when orgId actually changes and we don't have concepts yet
  useEffect(() => {
    if (orgId && orgId !== prevOrgIdRef.current && !hasConceptsRef.current) {
      console.log('Fetching concepts for new orgId:', orgId);
      fetchConcepts(orgId, conceptsPagination, setConceptsPagination, conceptId, storeId);
      prevOrgIdRef.current = orgId;
      hasConceptsRef.current = true;
    }
  }, [orgId]); // Only depend on orgId

  // Only fetch stores when conceptId actually changes and we don't have stores yet
  useEffect(() => {
    if (conceptId && conceptId !== prevConceptIdRef.current && !hasStoresRef.current) {
      console.log('Fetching stores for new conceptId:', conceptId);
      fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
      prevConceptIdRef.current = conceptId;
      hasStoresRef.current = true;
    }
  }, [conceptId]); // Only depend on conceptId

  // Reset refs when navigation changes
  useEffect(() => {
    if (!orgId) {
      hasConceptsRef.current = false;
      prevOrgIdRef.current = null;
    }
  }, [orgId]);

  useEffect(() => {
    if (!conceptId) {
      hasStoresRef.current = false;
      prevConceptIdRef.current = null;
    }
  }, [conceptId]);

  // Fetch concepts when pagination changes (only if we have an orgId and already have some concepts)
  useEffect(() => {
    if (orgId && hasConceptsRef.current && concepts.length > 0) {
      console.log('Fetching concepts for pagination change');
      fetchConcepts(orgId, conceptsPagination, setConceptsPagination, conceptId, storeId);
    }
  }, [conceptsPagination.page, conceptsPagination.pageSize]);

  // Fetch stores when pagination changes (only if we have a conceptId and already have some stores)
  useEffect(() => {
    if (conceptId && hasStoresRef.current && stores.length > 0) {
      console.log('Fetching stores for pagination change');
      fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
    }
  }, [storesPagination.page, storesPagination.pageSize]);

  // Only fetch users when orgId or conceptId changes
  useEffect(() => {
    if (orgId) {
      console.log('Fetching users for orgId:', orgId, 'conceptId:', conceptId);
      fetchUsers(orgId, conceptId || undefined);
    }
  }, [orgId, conceptId]); // Only depend on these IDs
  
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
