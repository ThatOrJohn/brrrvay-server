
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import OrganizationsList from '@/components/admin/OrganizationsList';
import ConceptsList from '@/components/admin/ConceptsList';
import StoresList from '@/components/admin/StoresList';
import UsersList from '@/components/admin/UsersList';
import EditModal from '@/components/admin/EditModal';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
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

  // Get breadcrumb data
  const getBreadcrumbData = () => {
    const selectedOrgData = selectedOrg ? organizations.find(o => o.id === selectedOrg) : null;
    const selectedConceptData = selectedConcept ? concepts.find(c => c.id === selectedConcept) : null;
    const selectedStoreData = storeId ? stores.find(s => s.id === storeId) : null;

    return {
      selectedOrg: selectedOrgData ? { id: selectedOrgData.id, name: selectedOrgData.name } : null,
      selectedConcept: selectedConceptData ? { id: selectedConceptData.id, name: selectedConceptData.name } : null,
      selectedStore: selectedStoreData ? { id: selectedStoreData.id, name: selectedStoreData.name } : null,
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Organization Management</h1>
        <p className="text-[#666666]">Manage your organizations, concepts, stores, and users</p>
      </div>
      
      <Breadcrumbs {...getBreadcrumbData()} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-sm text-red-500 flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
          {error}
        </div>
      )}

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <OrganizationsList
            organizations={organizations}
            selectedOrgId={orgId || null}
            newOrgName={newOrgName}
            onNewOrgNameChange={setNewOrgName}
            onAddOrganization={onAddOrganization}
            onEditOrganization={(org) => setEditState({
              type: 'organization',
              id: org.id,
              data: { name: org.name }
            })}
          />

          <ConceptsList
            concepts={concepts}
            selectedOrgId={orgId || null}
            selectedConceptId={conceptId || null}
            newConceptName={newConceptName}
            onNewConceptNameChange={setNewConceptName}
            onAddConcept={onAddConcept}
            onEditConcept={(concept) => setEditState({
              type: 'concept',
              id: concept.id,
              data: { name: concept.name }
            })}
            pagination={conceptsPagination}
            onPaginationChange={setConceptsPagination}
          />

          <StoresList
            stores={stores}
            selectedOrgId={orgId || null}
            selectedConceptId={conceptId || null}
            selectedStoreId={storeId || null}
            newStoreName={newStoreName}
            newStoreExternalId={newStoreExternalId}
            onNewStoreNameChange={setNewStoreName}
            onNewStoreExternalIdChange={setNewStoreExternalId}
            onAddStore={onAddStore}
            onEditStore={(store) => setEditState({
              type: 'store',
              id: store.id,
              data: {
                name: store.name,
                external_id: store.external_id || ''
              }
            })}
            pagination={storesPagination}
            onPaginationChange={setStoresPagination}
          />
        </div>

        {orgId && (
          <UsersList
            users={users}
            stores={stores}
            newUser={newUser}
            onNewUserChange={handleNewUserChange}
            onAddUser={onAddUser}
            onEditUser={(user) => setEditState({
              type: 'user',
              id: user.id,
              data: {
                email: user.email,
                name: user.name || ''
              }
            })}
          />
        )}
      </div>

      <EditModal
        editState={editState}
        item={getCurrentEditItem()}
        onEditStateChange={setEditState}
        onSave={onEdit}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
}
