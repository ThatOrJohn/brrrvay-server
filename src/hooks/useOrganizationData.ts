
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Organization, Concept, Store, User, PaginationState } from '@/types/admin';

export function useOrganizationData() {
  const { orgId, conceptId, storeId } = useParams();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      console.log('Fetching users for organization:', organizationId);
      
      const { data: concepts, error: conceptsError } = await supabase
        .from('concepts')
        .select('id')
        .eq('organization_id', organizationId);

      if (conceptsError) throw conceptsError;
      console.log('Found concepts:', concepts);

      if (!concepts?.length) {
        console.log('No concepts found for organization');
        setUsers([]);
        return;
      }

      const { data: orgStores, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .in('concept_id', concepts.map(c => c.id));

      if (storesError) throw storesError;
      console.log('Found stores:', orgStores);

      if (!orgStores?.length) {
        console.log('No stores found for concepts');
        setUsers([]);
        return;
      }

      const { data: userAccess, error: accessError } = await supabase
        .from('user_access')
        .select('user_id, store_id, organization_id, concept_id')
        .in('store_id', orgStores.map(s => s.id));

      if (accessError) throw accessError;
      console.log('Found user access records:', userAccess);

      if (!userAccess?.length) {
        console.log('No user access records found');
        setUsers([]);
        return;
      }

      const userIds = [...new Set(userAccess.map(ua => ua.user_id))];
      console.log('Unique user IDs:', userIds);

      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds)
        .order('email');

      if (error) throw error;
      console.log('Fetched users:', users);
      setUsers(users || []);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    }
  };

  // Effects
  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (orgId) {
      setSelectedOrg(orgId);
      setSelectedConcept(null);
      setStores([]);
      setConcepts([]);
      fetchConcepts(orgId);
      fetchUsers(orgId);
    } else {
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
      setSelectedConcept(null);
      setStores([]);
    }
  }, [conceptId, storesPagination.page]);

  return {
    // State
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
    
    // Setters
    setOrganizations,
    setConcepts,
    setStores,
    setUsers,
    setError,
    setConceptsPagination,
    setStoresPagination,
    
    // Functions
    fetchOrganizations,
    fetchConcepts,
    fetchStores,
    fetchUsers,
  };
}
