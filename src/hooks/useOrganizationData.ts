import { useState, useEffect, useRef } from 'react';
import { useUrlParams } from './useUrlParams';
import { usePaginationState } from './usePaginationState';
import { useOrganizationsFetcher } from './useOrganizationsFetcher';
import { useConceptsFetcher } from './useConceptsFetcher';
import { useStoresFetcher } from './useStoresFetcher';
import { useUsersFetcher } from './useUsersFetcher';

export function useOrganizationData() {
  const { orgId, conceptId, storeId } = useUrlParams();
  const {
    conceptsPagination,
    storesPagination,
    setConceptsPagination,
    setStoresPagination,
  } = usePaginationState();

  const {
    organizations,
    setOrganizations,
    fetchOrganizations,
  } = useOrganizationsFetcher();

  const {
    concepts,
    setConcepts,
    fetchConcepts: baseFetchConcepts,
  } = useConceptsFetcher();

  const {
    stores,
    setStores,
    fetchStores: baseFetchStores,
  } = useStoresFetcher();

  const {
    users,
    setUsers,
    fetchUsers: baseFetchUsers,
  } = useUsersFetcher();

  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple request tracking - just track if we're currently making a request
  const requestInProgressRef = useRef({
    organizations: false,
    concepts: false,
    stores: false,
    users: false,
  });

  // Load organizations only once on mount
  useEffect(() => {
    const loadOrganizations = async () => {
      if (requestInProgressRef.current.organizations) return;
      
      requestInProgressRef.current.organizations = true;
      try {
        await fetchOrganizations();
      } catch (err) {
        setError('Failed to fetch organizations');
      } finally {
        setLoading(false);
        requestInProgressRef.current.organizations = false;
      }
    };
    
    loadOrganizations();
  }, []); // Only run once

  // Handle organization selection
  useEffect(() => {
    if (orgId !== selectedOrg) {
      setSelectedOrg(orgId);
      setSelectedConcept(null);
      
      // Clear dependent data
      setConcepts([]);
      setStores([]);
      setUsers([]);
    }
  }, [orgId, selectedOrg]);

  // Handle concept selection
  useEffect(() => {
    if (conceptId !== selectedConcept) {
      setSelectedConcept(conceptId);
      
      // Clear dependent data
      setStores([]);
    }
  }, [conceptId, selectedConcept]);

  // Simple fetch functions that just prevent concurrent requests
  const fetchConcepts = async (
    orgIdToFetch: string, 
    pagination: any, 
    setPagination: any, 
    conceptIdParam?: string | null, 
    storeIdParam?: string | null
  ) => {
    if (requestInProgressRef.current.concepts) {
      console.log('Concepts request already in progress, skipping');
      return;
    }
    
    requestInProgressRef.current.concepts = true;
    try {
      console.log('Fetching concepts for org:', orgIdToFetch);
      await baseFetchConcepts(orgIdToFetch, pagination, setPagination, conceptIdParam, storeIdParam);
    } catch (error) {
      console.error('Error fetching concepts:', error);
      setError('Failed to fetch concepts');
    } finally {
      requestInProgressRef.current.concepts = false;
    }
  };

  const fetchStores = async (
    conceptIdToFetch: string, 
    pagination: any, 
    setPagination: any, 
    storeIdParam?: string | null
  ) => {
    if (requestInProgressRef.current.stores) {
      console.log('Stores request already in progress, skipping');
      return;
    }
    
    requestInProgressRef.current.stores = true;
    try {
      console.log('Fetching stores for concept:', conceptIdToFetch);
      await baseFetchStores(conceptIdToFetch, pagination, setPagination, storeIdParam);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to fetch stores');
    } finally {
      requestInProgressRef.current.stores = false;
    }
  };

  const fetchUsers = async (orgIdToFetch: string, conceptIdParam?: string) => {
    if (requestInProgressRef.current.users) {
      console.log('Users request already in progress, skipping');
      return;
    }
    
    requestInProgressRef.current.users = true;
    try {
      console.log('Fetching users for org:', orgIdToFetch, 'concept:', conceptIdParam);
      await baseFetchUsers(orgIdToFetch, conceptIdParam);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      requestInProgressRef.current.users = false;
    }
  };

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

    // Fetch functions
    fetchOrganizations,
    fetchConcepts,
    fetchStores,
    fetchUsers,
  };
}