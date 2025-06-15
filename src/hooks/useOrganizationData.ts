
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

  // Only auto-load organizations list on mount
  useEffect(() => {
    const handleFetchOrganizations = async () => {
      try {
        await fetchOrganizations();
      } catch (err) {
        setError('Failed to fetch organizations');
      } finally {
        setLoading(false);
      }
    };
    handleFetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle organization selection: clear concepts/stores/users so they are not stale; do not auto-fetch
  useEffect(() => {
    if (orgId) {
      setSelectedOrg(orgId);
      setSelectedConcept(null);
      setConcepts([]);
      setStores([]);
      setUsers([]);
    } else {
      setSelectedOrg(null);
      setSelectedConcept(null);
      setConcepts([]);
      setStores([]);
      setUsers([]);
    }
    // Intentionally do NOT fetchConcepts or fetchUsers here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // Handle concept selection: clear stores/users so they are not stale; do not auto-fetch
  useEffect(() => {
    if (conceptId && orgId) {
      setSelectedConcept(conceptId);
      setStores([]);
      setUsers([]);
    } else {
      setSelectedConcept(null);
      setStores([]);
      setUsers([]);
    }
    // Intentionally do NOT fetchStores here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conceptId, orgId]);

  // No fetching users/concepts/stores on pagination/state change; leave as manual trigger from consumers

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

    // Fetch functions must now be called manually as needed
    fetchOrganizations,
    fetchConcepts,
    fetchStores,
    fetchUsers,
  };
}
