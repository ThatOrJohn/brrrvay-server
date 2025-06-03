import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import bcrypt from 'bcryptjs';

type Organization = {
  id: string;
  name: string;
  created_at: string;
  trial_ends_at: string | null;
};

type Concept = {
  id: string;
  name: string;
  organization_id: string;
};

type Store = {
  id: string;
  name: string;
  concept_id: string;
  external_id: string | null;
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
      fetchConcepts(orgId);
      fetchUsers(orgId);
    }
  }, [orgId, conceptsPagination.page]);

  useEffect(() => {
    if (conceptId) {
      setSelectedConcept(conceptId);
      fetchStores(conceptId);
    }
  }, [conceptId, storesPagination.page]);

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

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
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
      const { count } = await supabase
        .from('concepts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      const { data, error } = await supabase
        .from('concepts')
        .select('*')
        .eq('organization_id', orgId)
        .order('name')
        .range(
          (conceptsPagination.page - 1) * conceptsPagination.pageSize,
          conceptsPagination.page * conceptsPagination.pageSize - 1
        );
      
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
      const { count } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true })
        .eq('concept_id', conceptId);

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('concept_id', conceptId)
        .order('name')
        .range(
          (storesPagination.page - 1) * storesPagination.pageSize,
          storesPagination.page * storesPagination.pageSize - 1
        );
      
      if (error) throw error;
      setStores(data || []);
      setStoresPagination(prev => ({ ...prev, total: count || 0 }));
    } catch (err) {
      setError('Failed to fetch stores');
      console.error(err);
    }
  };

  const fetchUsers = async (orgId: string) => {
    try {
      const { data: userAccess } = await supabase
        .from('user_access')
        .select('user_id')
        .eq('organization_id', orgId);

      if (!userAccess?.length) {
        setUsers([]);
        return;
      }

      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .in('id', userAccess.map(ua => ua.user_id))
        .order('email');

      if (error) throw error;
      setUsers(users || []);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg || !newUser.selectedStores.length) return;

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
        organization_id: selectedOrg,
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
      
      fetchUsers(selectedOrg);
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

  const renderBreadcrumbs = () => {
    const crumbs = [];
    
    if (selectedOrg) {
      const org = organizations.find(o => o.id === selectedOrg);
      crumbs.push(
        <Link 
          key="org" 
          to={`/admin/organizations/${selectedOrg}`}
          className="text-indigo-400 hover:text-indigo-300"
        >
          {org?.name}
        </Link>
      );
    }

    if (selectedConcept) {
      const concept = concepts.find(c => c.id === selectedConcept);
      crumbs.push(
        <span key="sep1" className="mx-2 text-[#666666]">/</span>,
        <Link 
          key="concept"
          to={`/admin/organizations/${selectedOrg}/concepts/${selectedConcept}`}
          className="text-indigo-400 hover:text-indigo-300"
        >
          {concept?.name}
        </Link>
      );
    }

    if (storeId) {
      const store = stores.find(s => s.id === storeId);
      crumbs.push(
        <span key="sep2" className="mx-2 text-[#666666]">/</span>,
        <span key="store" className="text-white">
          {store?.name}
        </span>
      );
    }

    return (
      <div className="mb-6 text-lg">
        {crumbs}
      </div>
    );
  };

  const renderPagination = (
    pagination: PaginationState,
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>,
    label: string
  ) => {
    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    
    return (
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-[#666666]">
          {label} {pagination.total} total
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-3 py-1 bg-[#2A2A2A] text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 bg-[#2A2A2A] text-white rounded-lg">
            Page {pagination.page} of {totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= totalPages}
            className="px-3 py-1 bg-[#2A2A2A] text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editState.type || !editState.id) return null;

    let item;
    switch (editState.type) {
      case 'organization':
        item = organizations.find(o => o.id === editState.id);
        break;
      case 'concept':
        item = concepts.find(c => c.id === editState.id);
        break;
      case 'store':
        item = stores.find(s => s.id === editState.id);
        break;
      case 'user':
        item = users.find(u => u.id === editState.id);
        break;
    }

    if (!item) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">
            Edit {editState.type}
          </h3>

          <div className="space-y-4">
            {editState.type === 'user' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editState.data.email || item.email}
                    onChange={(e) => setEditState(prev => ({
                      ...prev,
                      data: { ...prev.data, email: e.target.value }
                    }))}
                    className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editState.data.name || item.name || ''}
                    onChange={(e) => setEditState(prev => ({
                      ...prev,
                      data: { ...prev.data, name: e.target.value }
                    }))}
                    className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-1">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    value={editState.data.password || ''}
                    onChange={(e) => setEditState(prev => ({
                      ...prev,
                      data: { ...prev.data, password: e.target.value }
                    }))}
                    className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                  />
                </div>
              </>
            ) : editState.type === 'store' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editState.data.name || item.name}
                    onChange={(e) => setEditState(prev => ({
                      ...prev,
                      data: { ...prev.data, name: e.target.value }
                    }))}
                    className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-1">
                    External ID
                  </label>
                  <input
                    type="text"
                    value={editState.data.external_id || item.external_id || ''}
                    onChange={(e) => setEditState(prev => ({
                      ...prev,
                      data: { ...prev.data, external_id: e.target.value }
                    }))}
                    className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editState.data.name || item.name}
                  onChange={(e) => setEditState(prev => ({
                    ...prev,
                    data: { ...prev.data, name: e.target.value }
                  }))}
                  className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setEditState({ type: null, id: null, data: {} })}
              className="px-4 py-2 text-[#666666] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Organization Management</h1>
      
      {renderBreadcrumbs()}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Organizations Panel */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Organizations</h2>
          
          <form onSubmit={handleAddOrganization} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="New organization name"
                className="flex-1 rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {organizations.map(org => (
              <div key={org.id} className="flex items-center gap-2">
                <Link
                  to={`/admin/organizations/${org.id}`}
                  className={`flex-1 text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedOrg === org.id
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-[#2A2A2A] text-[#666666]'
                  }`}
                >
                  {org.name}
                </Link>
                <button
                  onClick={() => setEditState({
                    type: 'organization',
                    id: org.id,
                    data: { name: org.name }
                  })}
                  className="p-2 text-[#666666] hover:text-white rounded-lg hover:bg-[#2A2A2A]"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Concepts Panel */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Concepts</h2>
          
          {selectedOrg && (
            <form onSubmit={handleAddConcept} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newConceptName}
                  onChange={(e) => setNewConceptName(e.target.value)}
                  placeholder="New concept name"
                  className="flex-1 rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {concepts.map(concept => (
              <div key={concept.id} className="flex items-center gap-2">
                <Link
                  to={`/admin/organizations/${selectedOrg}/concepts/${concept.id}`}
                  className={`flex-1 text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedConcept === concept.id
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-[#2A2A2A] text-[#666666]'
                  }`}
                >
                  {concept.name}
                </Link>
                <button
                  onClick={() => setEditState({
                    type: 'concept',
                    id: concept.id,
                    data: { name: concept.name }
                  })}
                  className="p-2 text-[#666666] hover:text-white rounded-lg hover:bg-[#2A2A2A]"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>

          {selectedOrg && renderPagination(
            conceptsPagination,
            setConceptsPagination,
            'Concepts:'
          )}
        </div>

        {/* Stores Panel */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Stores</h2>
          
          {selectedConcept && (
            <form onSubmit={handleAddStore} className="mb-6 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="New store name"
                  className="flex-1 rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStoreExternalId}
                  onChange={(e) => setNewStoreExternalId(e.target.value)}
                  placeholder="External ID (optional)"
                  className="flex-1 rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {stores.map(store => (
              <div key={store.id} className="flex items-center gap-2">
                <Link
                  to={`/admin/organizations/${selectedOrg}/concepts/${selectedConcept}/stores/${store.id}`}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]"
                >
                  <div>{store.name}</div>
                  {store.external_id && (
                    <div className="text-sm text-[#666666]">
                      ID: {store.external_id}
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => setEditState({
                    type: 'store',
                    id: store.id,
                    data: {
                      name: store.name,
                      external_id: store.external_id || ''
                    }
                  })}
                  className="p-2 text-[#666666] hover:text-white rounded-lg hover:bg-[#2A2A2A]"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>

          {selectedConcept && renderPagination(
            storesPagination,
            setStoresPagination,
            'Stores:'
          )}
        </div>
      </div>

      {/* Users Panel */}
      {selectedOrg && (
        <div className="mt-8 bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Store Users</h2>

          <form onSubmit={handleAddUser} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#666666] mb-1">
                Accessible Stores
              </label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {stores.map(store => (
                  <label key={store.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newUser.selectedStores.includes(store.id)}
                      onChange={(e) => {
                        const storeId = store.id;
                        setNewUser(prev => ({
                          ...prev,
                          selectedStores: e.target.checked
                            ? [...prev.selectedStores, storeId]
                            : prev.selectedStores.filter(id => id !== storeId)
                        }));
                      }}
                      className="rounded bg-[#2A2A2A] border-[#333333] text-indigo-600"
                    />
                    <span className="text-white">{store.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Store User
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#333333]">
                  <th className="pb-2 font-medium text-[#666666]">Email</th>
                  <th className="pb-2 font-medium text-[#666666]">Name</th>
                  <th className="pb-2 font-medium text-[#666666]">Role</th>
                  <th className="pb-2 font-medium text-[#666666]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-[#333333]">
                    <td className="py-3">{user.email}</td>
                    <td className="py-3">{user.name || '-'}</td>
                    <td className="py-3">{user.role}</td>
                    <td className="py-3">
                      <button
                        onClick={() => setEditState({
                          type: 'user',
                          id: user.id,
                          data: {
                            email: user.email,
                            name: user.name || ''
                          }
                        })}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {renderEditModal()}
    </div>
  );
}