import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import OrganizationsList from '@/components/admin/OrganizationsList';
import ConceptsList from '@/components/admin/ConceptsList';
import StoresList from '@/components/admin/StoresList';
import StoreDetails from '@/components/admin/StoreDetails';
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

  // Get selected store data
  const selectedStore = storeId ? stores.find(s => s.id === storeId) : null;

  // If a store is selected, show the store details page
  if (storeId && selectedStore) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="mb-8">
          <Breadcrumbs {...getBreadcrumbData()} />
        </div>
        
        <StoreDetails 
          store={selectedStore} 
          storeName={selectedStore.name}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8 animate-fade-in">
      {/* Enhanced header with subtle animations */}
      <div className="mb-8 transform transition-all duration-300 hover:scale-[1.01]">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
          Organization Management
        </h1>
        <p className="text-[#888888] transition-colors duration-300 hover:text-[#aaaaaa]">
          Manage your organizations, concepts, stores, and users with ease
        </p>
      </div>
      
      <div className="transform transition-all duration-300">
        <Breadcrumbs {...getBreadcrumbData()} />
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl p-4 mb-8 text-sm text-red-400 flex items-center animate-scale-in backdrop-blur-sm">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-3 flex-shrink-0 animate-pulse"></div>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Enhanced grid with stagger animation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
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
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
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
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
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
        </div>

        {orgId && (
          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
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
          </div>
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
