
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';
import OrganizationsList from '@/components/admin/OrganizationsList';
import ConceptsList from '@/components/admin/ConceptsList';
import StoresList from '@/components/admin/StoresList';
import UsersList from '@/components/admin/UsersList';
import EditModal from '@/components/admin/EditModal';
import Breadcrumbs from '@/components/admin/Breadcrumbs';

type Organization = {
  id: string;
  name: string;
  created_at: string;
  trial_ends_at: string | null;
  is_active: boolean;
};

type Concept = {
  id: string;
  name: string;
  organization_id: string;
  is_active: boolean;
};

type Store = {
  id: string;
  name: string;
  concept_id: string;
  external_id: string | null;
  is_active: boolean;
};

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password_hash: string | null;
  created_at: string;
};

type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

type EditState = {
  type: 'organization' | 'concept' | 'store' | 'user' | null;
  id: string | null;
  data: {
    name?: string;
    email?: string;
    external_id?: string;
    password?: string;
  };
};

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const { orgId, conceptId, storeId } = useParams();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({
    type: null,
    id: null,
    data: {}
  });

  // New user form state
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    selectedStores: [] as string[]
  });

  // Pagination states
  const [conceptsPagination, setConceptsPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const [storesPagination, setStoresPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // Form states
  const [newOrgName, setNewOrgName] = useState('');
  const [newConceptName, setNewConceptName] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreExternalId, setNewStoreExternalId] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (orgId) {
      setSelectedOrg(orgId);
      // Clear dependent states when organization changes
      setSelectedConcept(null);
      setStores([]);
      setConcepts([]);
      fetchConcepts(orgId);
      fetchUsers(orgId);
    } else {
      // Clear all dependent states when no organization is selected
      setSelectedOrg(null);
      setSelectedConcept(null);
      setConcepts([]);
      setStores([]);
      setUsers([]);
    }
  }, [orgId, conceptsPagination.page]);

  useEffect(() => {
    if (conceptId && orgId) {
      setSelectedConcept(conceptId);
      fetchStores(conceptId);
    } else {
      // Clear stores when no concept is selected
      setSelectedConcept(null);
      setStores([]);
    }
  }, [conceptId, storesPagination.page]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setOrganizations(data || []);
    } catch (err) {
      setError('Failed to fetch organizations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConcepts = async (orgId: string) => {
    try {
      // Check if we need to include inactive items (when navigating to specific concept/store)
      const includeInactive = conceptId || storeId;
      
      const countQuery = supabase
        .from('concepts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      
      if (!includeInactive) {
        countQuery.eq('is_active', true);
      }
      
      const { count } = await countQuery;

      const dataQuery = supabase
        .from('concepts')
        .select('*')
        .eq('organization_id', orgId)
        .order('name')
        .range(
          (conceptsPagination.page - 1) * conceptsPagination.pageSize,
          conceptsPagination.page * conceptsPagination.pageSize - 1
        );
      
      if (!includeInactive) {
        dataQuery.eq('is_active', true);
      }
      
      const { data, error } = await dataQuery;
      
      if (error) throw error;
      setConcepts(data || []);
      setConceptsPagination(prev => ({ ...prev, total: count || 0 }));
    } catch (err) {
      setError('Failed to fetch concepts');
      console.error(err);
    }
  };

  const fetchStores = async (conceptId: string) => {
    try {
      // Include inactive stores when navigating to a specific store
      const includeInactive = storeId;
      
      const countQuery = supabase
        .from('stores')
        .select('*', { count: 'exact', head: true })
        .eq('concept_id', conceptId);
      
      if (!includeInactive) {
        countQuery.eq('is_active', true);
      }
      
      const { count } = await countQuery;

      const dataQuery = supabase
        .from('stores')
        .select('*')
        .eq('concept_id', conceptId)
        .order('name')
        .range(
          (storesPagination.page - 1) * storesPagination.pageSize,
          storesPagination.page * storesPagination.pageSize - 1
        );
      
      if (!includeInactive) {
        dataQuery.eq('is_active', true);
      }
      
      const { data, error } = await dataQuery;
      
      if (error) throw error;
      setStores(data || []);
      setStoresPagination(prev => ({ ...prev, total: count || 0 }));
    } catch (err) {
      setError('Failed to fetch stores');
      console.error(err);
    }
  };

  const fetchUsers = async (organizationId: string) => {
    try {
      // First get all stores for this organization
      const { data: orgStores } = await supabase
        .from('stores')
        .select('id')
        .in('concept_id', 
          (await supabase
            .from('concepts')
            .select('id')
            .eq('organization_id', organizationId)
          ).data?.map(c => c.id) || []
        );

      if (!orgStores?.length) {
        setUsers([]);
        return;
      }

      // Get user access for these stores
      const { data: userAccess } = await supabase
        .from('user_access')
        .select('user_id')
        .in('store_id', orgStores.map(s => s.id));

      if (!userAccess?.length) {
        setUsers([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(userAccess.map(ua => ua.user_id))];

      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds)
        .order('email');

      if (error) throw error;
      setUsers(users || []);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    }
  };

  const handleToggleActive = async (type: 'organization' | 'concept' | 'store', id: string, currentStatus: boolean) => {
    try {
      const tableName = type === 'organization' ? 'organizations' : type === 'concept' ? 'concepts' : 'stores';
      
      await supabase
        .from(tableName)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      // Refresh the appropriate data
      switch (type) {
        case 'organization':
          fetchOrganizations();
          break;
        case 'concept':
          if (selectedOrg) fetchConcepts(selectedOrg);
          break;
        case 'store':
          if (selectedConcept) fetchStores(selectedConcept);
          break;
      }
    } catch (err) {
      setError(`Failed to toggle ${type} status`);
      console.error(err);
    }
  };

  const handleEdit = async () => {
    if (!editState.type || !editState.id) return;

    try {
      switch (editState.type) {
        case 'organization':
          await supabase
            .from('organizations')
            .update({ name: editState.data.name })
            .eq('id', editState.id);
          fetchOrganizations();
          break;

        case 'concept':
          await supabase
            .from('concepts')
            .update({ name: editState.data.name })
            .eq('id', editState.id);
          if (selectedOrg) fetchConcepts(selectedOrg);
          break;

        case 'store':
          await supabase
            .from('stores')
            .update({
              name: editState.data.name,
              external_id: editState.data.external_id
            })
            .eq('id', editState.id);
          if (selectedConcept) fetchStores(selectedConcept);
          break;

        case 'user':
          const updates: any = {
            name: editState.data.name,
            email: editState.data.email
          };

          if (editState.data.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password_hash = await bcrypt.hash(editState.data.password, salt);
          }

          await supabase
            .from('users')
            .update(updates)
            .eq('id', editState.id);
          if (selectedOrg) fetchUsers(selectedOrg);
          break;
      }

      setEditState({ type: null, id: null, data: {} });
    } catch (err) {
      setError(`Failed to update ${editState.type}`);
      console.error(err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentOrgId = orgId;
    if (!currentOrgId || !newUser.selectedStores.length) return;

    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newUser.password, salt);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: newUser.email,
          name: newUser.name,
          role: 'store_user',
          password_hash: passwordHash
        })
        .select()
        .single();

      if (userError) throw userError;

      const storeAccess = newUser.selectedStores.map(storeId => ({
        user_id: userData.id,
        organization_id: currentOrgId,
        store_id: storeId
      }));

      const { error: accessError } = await supabase
        .from('user_access')
        .insert(storeAccess);

      if (accessError) throw accessError;

      setNewUser({
        email: '',
        name: '',
        password: '',
        selectedStores: []
      });
      
      fetchUsers(currentOrgId);
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
    }
  };

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{ name: newOrgName }])
        .select()
        .single();
      
      if (error) throw error;
      setOrganizations([...organizations, data]);
      setNewOrgName('');
    } catch (err) {
      setError('Failed to add organization');
      console.error(err);
    }
  };

  const handleAddConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    try {
      const { data, error } = await supabase
        .from('concepts')
        .insert([{
          name: newConceptName,
          organization_id: selectedOrg
        }])
        .select()
        .single();
      
      if (error) throw error;
      setConcepts([...concepts, data]);
      setNewConceptName('');
    } catch (err) {
      setError('Failed to add concept');
      console.error(err);
    }
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConcept) return;

    try {
      const { data, error } = await supabase
        .from('stores')
        .insert([{
          name: newStoreName,
          external_id: newStoreExternalId || null,
          concept_id: selectedConcept
        }])
        .select()
        .single();
      
      if (error) throw error;
      setStores([...stores, data]);
      setNewStoreName('');
      setNewStoreExternalId('');
    } catch (err) {
      setError('Failed to add store');
      console.error(err);
    }
  };

  const handleNewUserChange = (field: string, value: string | string[]) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
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
            onAddOrganization={handleAddOrganization}
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
            onAddConcept={handleAddConcept}
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
            onAddStore={handleAddStore}
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
            onAddUser={handleAddUser}
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
        onSave={handleEdit}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
}
