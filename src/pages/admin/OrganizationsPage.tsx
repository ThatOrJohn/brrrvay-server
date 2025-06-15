
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import StoreDetails from '@/components/admin/StoreDetails';
import OrganizationPageLayout from '@/components/admin/organization-page/OrganizationPageLayout';
import OrganizationBreadcrumbsContainer from '@/components/admin/organization-page/OrganizationBreadcrumbsContainer';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { useOrganizationActions } from '@/hooks/useOrganizationActions';
import { EditState, NewUser } from '@/types/admin';

export default function OrganizationsPage() {
  const { orgId, conceptId, storeId } = useParams();
  
  const {
    organizations,
    selectedOrg,
    concepts,
    selectedConcept,
    stores,
    users,
    loading,
    error,
    conceptsPagination,
    storesPagination,
    setOrganizations,
    setConcepts,
    setStores,
    setError,
    setConceptsPagination,
    setStoresPagination,
    fetchOrganizations,
    fetchConcepts,
    fetchStores,
    fetchUsers,
  } = useOrganizationData();

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
    onRefreshConcepts: fetchConcepts,
    onRefreshStores: fetchStores,
    onRefreshUsers: fetchUsers,
  });

  const [editState, setEditState] = useState<EditState>({
    type: null,
    id: null,
    data: {}
  });

  // New user form state
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    name: '',
    password: '',
    selectedStores: []
  });

  // Form states
  const [newOrgName, setNewOrgName] = useState('');
  const [newConceptName, setNewConceptName] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreExternalId, setNewStoreExternalId] = useState('');

  const handleNewUserChange = (field: string, value: string | string[]) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

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
      setNewUser({
        email: '',
        name: '',
        password: '',
        selectedStores: []
      });
    }
  };

  const onEdit = async () => {
    await handleEdit(editState, organizations, concepts, stores, users);
    setEditState({ type: null, id: null, data: {} });
  };

  // Get current item for edit modal
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

  // Get selected store data
  const selectedStore = storeId ? stores.find(s => s.id === storeId) : null;

  // If a store is selected, show the store details page
  if (storeId && selectedStore) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="mb-8">
          <OrganizationBreadcrumbsContainer
            organizations={organizations}
            concepts={concepts}
            stores={stores}
            selectedOrg={selectedOrg}
            selectedConcept={selectedConcept}
            storeId={storeId}
          />
        </div>
        
        <StoreDetails 
          store={selectedStore} 
          storeName={selectedStore.name}
        />
      </div>
    );
  }

  return (
    <OrganizationPageLayout
      organizations={organizations}
      concepts={concepts}
      stores={stores}
      users={users}
      selectedOrg={selectedOrg}
      selectedConcept={selectedConcept}
      orgId={orgId || null}
      conceptId={conceptId || null}
      storeId={storeId || null}
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
      onEditOrganization={(org) => setEditState({
        type: 'organization',
        id: org.id,
        data: { name: org.name }
      })}
      onEditConcept={(concept) => setEditState({
        type: 'concept',
        id: concept.id,
        data: { name: concept.name }
      })}
      onEditStore={(store) => setEditState({
        type: 'store',
        id: store.id,
        data: {
          name: store.name,
          external_id: store.external_id || ''
        }
      })}
      onEditUser={(user) => setEditState({
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
