
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

  // Wrapper functions to handle error state
  const handleFetchOrganizations = async () => {
    try {
      await fetchOrganizations();
    } catch (err) {
      setError('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchConcepts = async (orgId: string) => {
    try {
      await fetchConcepts(orgId, conceptsPagination, setConceptsPagination, conceptId, storeId);
    } catch (err) {
      setError('Failed to fetch concepts');
    }
  };

  const handleFetchStores = async (conceptId: string) => {
    try {
      await fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
    } catch (err) {
      setError('Failed to fetch stores');
    }
  };

  const handleFetchUsers = async (organizationId: string) => {
    try {
      // Pass the conceptId to filter users by the current concept
      await fetchUsers(organizationId, conceptId || undefined);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  // Effects
  useEffect(() => {
    handleFetchOrganizations();
  }, []);

  useEffect(() => {
    if (orgId) {
      setSelectedOrg(orgId);
      setSelectedConcept(null);
      setStores([]);
      setConcepts([]);
      handleFetchConcepts(orgId);
      handleFetchUsers(orgId);
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
      handleFetchStores(conceptId);
      // Refetch users when concept changes to filter by the new concept
      handleFetchUsers(orgId);
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
    fetchOrganizations: handleFetchOrganizations,
    fetchConcepts: handleFetchConcepts,
    fetchStores: handleFetchStores,
    fetchUsers: handleFetchUsers,
  };
}
