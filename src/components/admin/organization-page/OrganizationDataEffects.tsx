import { useEffect, useRef } from 'react';
import { PaginationState } from '@/types/admin';

interface OrganizationDataEffectsProps {
  orgId: string | null;
  conceptId: string | null;
  storeId: string | null;
  concepts: any[];
  stores: any[];
  conceptsPagination: PaginationState;
  storesPagination: PaginationState;
  fetchConcepts: (orgId: string, pagination: PaginationState, setPagination: (p: PaginationState) => void, conceptId?: string | null, storeId?: string | null) => void;
  fetchStores: (conceptId: string, pagination: PaginationState, setPagination: (p: PaginationState) => void, storeId?: string | null) => void;
  fetchUsers: (orgId: string, conceptId?: string) => void;
  setConceptsPagination: (pagination: PaginationState) => void;
  setStoresPagination: (pagination: PaginationState) => void;
}

export function useOrganizationDataEffects({
  orgId,
  conceptId,
  storeId,
  concepts,
  stores,
  conceptsPagination,
  storesPagination,
  fetchConcepts,
  fetchStores,
  fetchUsers,
  setConceptsPagination,
  setStoresPagination,
}: OrganizationDataEffectsProps) {
  // Use refs to track what we've already fetched to prevent duplicate calls
  const fetchedDataRef = useRef({
    conceptsForOrg: new Set<string>(),
    storesForConcept: new Set<string>(),
    usersForOrg: new Set<string>(),
    conceptsPaginationFetched: false,
    storesPaginationFetched: false,
  });

  // Reset tracking when navigation changes
  useEffect(() => {
    if (orgId) {
      fetchedDataRef.current.conceptsForOrg.clear();
      fetchedDataRef.current.usersForOrg.clear();
      fetchedDataRef.current.conceptsPaginationFetched = false;
    }
  }, [orgId]);

  useEffect(() => {
    if (conceptId) {
      fetchedDataRef.current.storesForConcept.clear();
      fetchedDataRef.current.storesPaginationFetched = false;
    }
  }, [conceptId]);

  // Fetch concepts when orgId is available and we haven't fetched them yet
  useEffect(() => {
    if (orgId && !fetchedDataRef.current.conceptsForOrg.has(orgId)) {
      console.log('Fetching concepts for orgId:', orgId);
      fetchConcepts(orgId, conceptsPagination, setConceptsPagination, conceptId, storeId);
      fetchedDataRef.current.conceptsForOrg.add(orgId);
    }
  }, [orgId, conceptId, storeId, fetchConcepts, conceptsPagination, setConceptsPagination]);

  // Fetch stores when conceptId is available and we haven't fetched them yet
  useEffect(() => {
    if (conceptId && !fetchedDataRef.current.storesForConcept.has(conceptId)) {
      console.log('Fetching stores for conceptId:', conceptId);
      fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
      fetchedDataRef.current.storesForConcept.add(conceptId);
    }
  }, [conceptId, storeId, fetchStores, storesPagination, setStoresPagination]);

  // Fetch users when orgId is available and we haven't fetched them yet
  useEffect(() => {
    const userKey = `${orgId}-${conceptId || 'all'}`;
    if (orgId && !fetchedDataRef.current.usersForOrg.has(userKey)) {
      console.log('Fetching users for orgId:', orgId, 'conceptId:', conceptId);
      fetchUsers(orgId, conceptId || undefined);
      fetchedDataRef.current.usersForOrg.add(userKey);
    }
  }, [orgId, conceptId, fetchUsers]);

  // Handle pagination changes (only fetch if we have data and pagination actually changed)
  useEffect(() => {
    if (orgId && concepts.length > 0 && !fetchedDataRef.current.conceptsPaginationFetched) {
      // Only fetch if this is a pagination change, not initial load
      if (conceptsPagination.page > 1 || conceptsPagination.pageSize !== 10) {
        console.log('Fetching concepts for pagination change');
        fetchConcepts(orgId, conceptsPagination, setConceptsPagination, conceptId, storeId);
      }
      fetchedDataRef.current.conceptsPaginationFetched = true;
    }
  }, [conceptsPagination.page, conceptsPagination.pageSize]);

  useEffect(() => {
    if (conceptId && stores.length > 0 && !fetchedDataRef.current.storesPaginationFetched) {
      // Only fetch if this is a pagination change, not initial load
      if (storesPagination.page > 1 || storesPagination.pageSize !== 10) {
        console.log('Fetching stores for pagination change');
        fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
      }
      fetchedDataRef.current.storesPaginationFetched = true;
    }
  }, [storesPagination.page, storesPagination.pageSize]);
}