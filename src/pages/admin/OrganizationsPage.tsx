import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newOrgName, setNewOrgName] = useState('');
  const [newConceptName, setNewConceptName] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreExternalId, setNewStoreExternalId] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchConcepts(selectedOrg);
      fetchUsers(selectedOrg);
    }
  }, [selectedOrg]);

  useEffect(() => {
    if (selectedConcept) {
      fetchStores(selectedConcept);
    }
  }, [selectedConcept]);

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
      const { data, error } = await supabase
        .from('concepts')
        .select('*')
        .eq('organization_id', orgId)
        .order('name');
      
      if (error) throw error;
      setConcepts(data || []);
    } catch (err) {
      setError('Failed to fetch concepts');
      console.error(err);
    }
  };

  const fetchStores = async (conceptId: string) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('concept_id', conceptId)
        .order('name');
      
      if (error) throw error;
      setStores(data || []);
    } catch (err) {
      setError('Failed to fetch stores');
      console.error(err);
    }
  };

  const fetchUsers = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', orgId)
        .order('email');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError('Failed to fetch users');
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

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Organization Management</h1>

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
              <button
                key={org.id}
                onClick={() => setSelectedOrg(org.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedOrg === org.id
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-[#2A2A2A] text-[#666666]'
                }`}
              >
                {org.name}
              </button>
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
              <button
                key={concept.id}
                onClick={() => setSelectedConcept(concept.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedConcept === concept.id
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-[#2A2A2A] text-[#666666]'
                }`}
              >
                {concept.name}
              </button>
            ))}
          </div>
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
              <div
                key={store.id}
                className="px-4 py-2 rounded-lg bg-[#2A2A2A] text-white"
              >
                <div>{store.name}</div>
                {store.external_id && (
                  <div className="text-sm text-[#666666]">
                    ID: {store.external_id}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users Panel */}
      {selectedOrg && (
        <div className="mt-8 bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          
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
                    <td className="py-2">{user.email}</td>
                    <td className="py-2">{user.name || '-'}</td>
                    <td className="py-2">{user.role}</td>
                    <td className="py-2">
                      <button
                        className="text-indigo-400 hover:text-indigo-300"
                        onClick={() => {/* TODO: Edit user */}}
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
    </div>
  );
}