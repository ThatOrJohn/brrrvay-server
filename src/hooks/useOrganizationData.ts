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
    fetchConcepts,
  } = useConceptsFetcher();

  const {
    stores,
    setStores,
    fetchStores,
  } = useStoresFetcher();

  const {
    users,
    setUsers,
    fetchUsers,
  } = useUsersFetcher();

  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track what's been fetched and prevent duplicates
  const fetchTracker = useRef({
    organizations: false,
    concepts: new Set<string>(),
    stores: new Set<string>(),
    users: new Set<string>(),
    conceptsPagination: new Set<string>(),
    storesPagination: new Set<string>(),
  });

  // Track current fetch operations to prevent concurrent calls
  const fetchingRef = useRef({
    organizations: false,
    concepts: false,
    stores: false,
    users: false,
  });

  // Only auto-load organizations list on mount
  useEffect(() => {
    const handleFetchOrganizations = async () => {
      if (fetchTracker.current.organizations || fetchingRef.current.organizations) return;
      
      fetchingRef.current.organizations = true;
      try {
        await fetchOrganizations();
        fetchTracker.current.organizations = true;
      } catch (err) {
        setError('Failed to fetch organizations');
      } finally {
        setLoading(false);
        fetchingRef.current.organizations = false;
      }
    };
    handleFetchOrganizations();
  }, []); // Only run once on mount

  // Handle organization selection
  useEffect(() => {
    if (orgId !== selectedOrg) {
      setSelectedOrg(orgId);
      setSelectedConcept(null);
      
      // Clear dependent data when org changes
      setConcepts([]);
      setStores([]);
      setUsers([]);
      
      // Reset fetch tracking for dependent data
      fetchTracker.current.concepts.clear();
      fetchTracker.current.stores.clear();
      fetchTracker.current.users.clear();
      fetchTracker.current.conceptsPagination.clear();
      fetchTracker.current.storesPagination.clear();
    }
  }, [orgId, selectedOrg, setConcepts, setStores, setUsers]);

  // Handle concept selection
  useEffect(() => {
    if (conceptId !== selectedConcept) {
      setSelectedConcept(conceptId);
      
      // Clear dependent data when concept changes
      setStores([]);
      
      // Reset fetch tracking for dependent data
      fetchTracker.current.stores.clear();
      fetchTracker.current.storesPagination.clear();
    }
  }, [conceptId, selectedConcept, setStores]);

  // Create wrapper functions that prevent duplicate calls
  const fetchConceptsOnce = async (orgIdToFetch: string, pagination: any, setPagination: any, conceptIdParam?: string | null, storeIdParam?: string | null) => {
    const key = `${orgIdToFetch}-${conceptIdParam || 'null'}-${storeIdParam || 'null'}`;
    
    if (fetchTracker.current.concepts.has(key) || fetchingRef.current.concepts) {
      console.log('Skipping concepts fetch - already fetched or in progress:', key);
      return;
    }
    
    fetchingRef.current.concepts = true;
    try {
      console.log('Fetching concepts for:', key);
      await fetchConcepts(orgIdToFetch, pagination, setPagination, conceptIdParam, storeIdParam);
      fetchTracker.current.concepts.add(key);
    } catch (error) {
      console.error('Error fetching concepts:', error);
      setError('Failed to fetch concepts');
    } finally {
      fetchingRef.current.concepts = false;
    }
  };

  const fetchStoresOnce = async (conceptIdToFetch: string, pagination: any, setPagination: any, storeIdParam?: string | null) => {
    const key = `${conceptIdToFetch}-${storeIdParam || 'null'}`;
    
    if (fetchTracker.current.stores.has(key) || fetchingRef.current.stores) {
      console.log('Skipping stores fetch - already fetched or in progress:', key);
      return;
    }
    
    fetchingRef.current.stores = true;
    try {
      console.log('Fetching stores for:', key);
      await fetchStores(conceptIdToFetch, pagination, setPagination, storeIdParam);
      fetchTracker.current.stores.add(key);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to fetch stores');
    } finally {
      fetchingRef.current.stores = false;
    }
  };

  const fetchUsersOnce = async (orgIdToFetch: string, conceptIdParam?: string) => {
    const key = `${orgIdToFetch}-${conceptIdParam || 'null'}`;
    
    if (fetchTracker.current.users.has(key) || fetchingRef.current.users) {
      console.log('Skipping users fetch - already fetched or in progress:', key);
      return;
    }
    
    fetchingRef.current.users = true;
    try {
      console.log('Fetching users for:', key);
      await fetchUsers(orgIdToFetch, conceptIdParam);
      fetchTracker.current.users.add(key);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      fetchingRef.current.users = false;
    }
  };

  // Reset fetch tracking when we need to refresh
  const resetFetchTracking = (keys: string[]) => {
    keys.forEach(key => {
      switch (key) {
        case 'organizations':
          fetchTracker.current.organizations = false;
          break;
        case 'concepts':
          fetchTracker.current.concepts.clear();
          break;
        case 'stores':
          fetchTracker.current.stores.clear();
          break;
        case 'users':
          fetchTracker.current.users.clear();
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

    // Fetch functions that prevent duplicate calls
    fetchOrganizations: async () => {
      if (!fetchingRef.current.organizations) {
        fetchingRef.current.organizations = true;
        try {
          await fetchOrganizations();
          fetchTracker.current.organizations = true;
        } finally {
          fetchingRef.current.organizations = false;
        }
      }
    },
    fetchConcepts: fetchConceptsOnce,
    fetchStores: fetchStoresOnce,
    fetchUsers: fetchUsersOnce,
    
    // Utility to force refresh
    resetFetchTracking,
  };
}