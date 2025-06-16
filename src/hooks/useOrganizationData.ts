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

  // Track what's been loaded to prevent duplicate requests
  const loadedDataRef = useRef({
    organizations: false,
    concepts: new Map<string, boolean>(),
    stores: new Map<string, boolean>(),
    users: new Map<string, boolean>(),
  });

  // Track active requests to prevent concurrent calls
  const activeRequestsRef = useRef({
    organizations: false,
    concepts: false,
    stores: false,
    users: false,
  });

  // Only load organizations once on mount
  useEffect(() => {
    const loadOrganizations = async () => {
      if (loadedDataRef.current.organizations || activeRequestsRef.current.organizations) {
        return;
      }
      
      activeRequestsRef.current.organizations = true;
      try {
        await fetchOrganizations();
        loadedDataRef.current.organizations = true;
      } catch (err) {
        setError('Failed to fetch organizations');
      } finally {
        setLoading(false);
        activeRequestsRef.current.organizations = false;
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
      
      // Clear loaded flags for dependent data
      loadedDataRef.current.concepts.clear();
      loadedDataRef.current.stores.clear();
      loadedDataRef.current.users.clear();
    }
  }, [orgId, selectedOrg]);

  // Handle concept selection
  useEffect(() => {
    if (conceptId !== selectedConcept) {
      setSelectedConcept(conceptId);
      
      // Clear dependent data
      setStores([]);
      
      // Clear loaded flags for dependent data
      loadedDataRef.current.stores.clear();
    }
  }, [conceptId, selectedConcept]);

  // Create wrapped fetch functions that prevent duplicates
  const fetchConcepts = async (
    orgIdToFetch: string, 
    pagination: any, 
    setPagination: any, 
    conceptIdParam?: string | null, 
    storeIdParam?: string | null
  ) => {
    const key = `${orgIdToFetch}-${pagination.page}-${pagination.pageSize}-${conceptIdParam || ''}-${storeIdParam || ''}`;
    
    if (loadedDataRef.current.concepts.get(key) || activeRequestsRef.current.concepts) {
      console.log('Skipping concepts fetch - already loaded or in progress:', key);
      return;
    }
    
    activeRequestsRef.current.concepts = true;
    try {
      console.log('Fetching concepts for key:', key);
      await baseFetchConcepts(orgIdToFetch, pagination, setPagination, conceptIdParam, storeIdParam);
      loadedDataRef.current.concepts.set(key, true);
    } catch (error) {
      console.error('Error fetching concepts:', error);
      setError('Failed to fetch concepts');
    } finally {
      activeRequestsRef.current.concepts = false;
    }
  };

  const fetchStores = async (
    conceptIdToFetch: string, 
    pagination: any, 
    setPagination: any, 
    storeIdParam?: string | null
  ) => {
    const key = `${conceptIdToFetch}-${pagination.page}-${pagination.pageSize}-${storeIdParam || ''}`;
    
    if (loadedDataRef.current.stores.get(key) || activeRequestsRef.current.stores) {
      console.log('Skipping stores fetch - already loaded or in progress:', key);
      return;
    }
    
    activeRequestsRef.current.stores = true;
    try {
      console.log('Fetching stores for key:', key);
      await baseFetchStores(conceptIdToFetch, pagination, setPagination, storeIdParam);
      loadedDataRef.current.stores.set(key, true);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to fetch stores');
    } finally {
      activeRequestsRef.current.stores = false;
    }
  };

  const fetchUsers = async (orgIdToFetch: string, conceptIdParam?: string) => {
    const key = `${orgIdToFetch}-${conceptIdParam || ''}`;
    
    if (loadedDataRef.current.users.get(key) || activeRequestsRef.current.users) {
      console.log('Skipping users fetch - already loaded or in progress:', key);
      return;
    }
    
    activeRequestsRef.current.users = true;
    try {
      console.log('Fetching users for key:', key);
      await baseFetchUsers(orgIdToFetch, conceptIdParam);
      loadedDataRef.current.users.set(key, true);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      activeRequestsRef.current.users = false;
    }
  };

  // Force refresh function that clears cache
  const forceRefresh = (dataTypes: string[]) => {
    dataTypes.forEach(type => {
      switch (type) {
        case 'organizations':
          loadedDataRef.current.organizations = false;
          break;
        case 'concepts':
          loadedDataRef.current.concepts.clear();
          break;
        case 'stores':
          loadedDataRef.current.stores.clear();
          break;
        case 'users':
          loadedDataRef.current.users.clear();
          break;
      }
    });
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

    // Fetch functions with duplicate prevention
    fetchOrganizations: async () => {
      if (!activeRequestsRef.current.organizations) {
        activeRequestsRef.current.organizations = true;
        try {
          await fetchOrganizations();
          loadedDataRef.current.organizations = true;
        } finally {
          activeRequestsRef.current.organizations = false;
        }
      }
    },
    fetchConcepts,
    fetchStores,
    fetchUsers,
    
    // Force refresh utility
    forceRefresh,
  };
}