import { useState, useEffect } from 'react';
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
  const [dataLoaded, setDataLoaded] = useState({
    organizations: false,
    concepts: false,
    stores: false,
    users: false,
  });

  // Only auto-load organizations list on mount
  useEffect(() => {
    const handleFetchOrganizations = async () => {
      if (dataLoaded.organizations) return;
      
      try {
        await fetchOrganizations();
        setDataLoaded(prev => ({ ...prev, organizations: true }));
      } catch (err) {
        setError('Failed to fetch organizations');
      } finally {
        setLoading(false);
      }
    };
    handleFetchOrganizations();
  }, [dataLoaded.organizations, fetchOrganizations]);

  // Handle organization selection: clear dependent data and set selected org
  useEffect(() => {
    if (orgId !== selectedOrg) {
      setSelectedOrg(orgId);
      setSelectedConcept(null);
      
      // Clear dependent data when org changes
      if (orgId !== selectedOrg) {
        setConcepts([]);
        setStores([]);
        setUsers([]);
        setDataLoaded(prev => ({ 
          ...prev, 
          concepts: false, 
          stores: false, 
          users: false 
        }));
      }
    }
  }, [orgId, selectedOrg, setConcepts, setStores, setUsers]);

  // Handle concept selection: clear dependent data
  useEffect(() => {
    if (conceptId !== selectedConcept) {
      setSelectedConcept(conceptId);
      
      // Clear dependent data when concept changes
      if (conceptId !== selectedConcept) {
        setStores([]);
        setDataLoaded(prev => ({ ...prev, stores: false }));
      }
    }
  }, [conceptId, selectedConcept, setStores]);

  // Create wrapper functions that respect the dataLoaded state
  const fetchConceptsOnce = async (orgIdToFetch: string, pagination: any, setPagination: any, conceptIdParam?: string | null, storeIdParam?: string | null) => {
    if (dataLoaded.concepts && !conceptIdParam && !storeIdParam) return;
    
    try {
      await fetchConcepts(orgIdToFetch, pagination, setPagination, conceptIdParam, storeIdParam);
      setDataLoaded(prev => ({ ...prev, concepts: true }));
    } catch (error) {
      console.error('Error fetching concepts:', error);
      setError('Failed to fetch concepts');
    }
  };

  const fetchStoresOnce = async (conceptIdToFetch: string, pagination: any, setPagination: any, storeIdParam?: string | null) => {
    if (dataLoaded.stores && !storeIdParam) return;
    
    try {
      await fetchStores(conceptIdToFetch, pagination, setPagination, storeIdParam);
      setDataLoaded(prev => ({ ...prev, stores: true }));
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to fetch stores');
    }
  };

  const fetchUsersOnce = async (orgIdToFetch: string, conceptIdParam?: string) => {
    if (dataLoaded.users) return;
    
    try {
      await fetchUsers(orgIdToFetch, conceptIdParam);
      setDataLoaded(prev => ({ ...prev, users: true }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  // Reset data loaded flags when we need to refresh
  const resetDataLoaded = (keys: (keyof typeof dataLoaded)[]) => {
    setDataLoaded(prev => {
      const newState = { ...prev };
      keys.forEach(key => {
        newState[key] = false;
      });
      return newState;
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
      await fetchOrganizations();
      setDataLoaded(prev => ({ ...prev, organizations: true }));
    },
    fetchConcepts: fetchConceptsOnce,
    fetchStores: fetchStoresOnce,
    fetchUsers: fetchUsersOnce,
    
    // Utility to force refresh
    resetDataLoaded,
  };
}