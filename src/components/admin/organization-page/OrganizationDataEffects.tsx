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
  
  // Track what we've already triggered to prevent duplicate calls
  const triggeredRef = useRef({
    concepts: new Set<string>(),
    stores: new Set<string>(),
    users: new Set<string>(),
  });

  // Fetch concepts when orgId changes (only once per unique combination)
  useEffect(() => {
    if (orgId) {
      const key = `${orgId}-${conceptId || ''}-${storeId || ''}`;
      if (!triggeredRef.current.concepts.has(key)) {
        console.log('Effect: Triggering concepts fetch for:', key);
        triggeredRef.current.concepts.add(key);
        fetchConcepts(orgId, conceptsPagination, setConceptsPagination, conceptId, storeId);
      }
    }
  }, [orgId]); // Only orgId dependency

  // Fetch stores when conceptId changes (only once per unique combination)
  useEffect(() => {
    if (conceptId) {
      const key = `${conceptId}-${storeId || ''}`;
      if (!triggeredRef.current.stores.has(key)) {
        console.log('Effect: Triggering stores fetch for:', key);
        triggeredRef.current.stores.add(key);
        fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
      }
    }
  }, [conceptId]); // Only conceptId dependency

  // Fetch users when orgId or conceptId changes (only once per unique combination)
  useEffect(() => {
    if (orgId) {
      const key = `${orgId}-${conceptId || ''}`;
      if (!triggeredRef.current.users.has(key)) {
        console.log('Effect: Triggering users fetch for:', key);
        triggeredRef.current.users.add(key);
        fetchUsers(orgId, conceptId || undefined);
      }
    }
  }, [orgId, conceptId]); // Both dependencies since users can be filtered by concept

  // Clear triggered flags when navigation changes
  useEffect(() => {
    return () => {
      triggeredRef.current.concepts.clear();
      triggeredRef.current.stores.clear();
      triggeredRef.current.users.clear();
    };
  }, [orgId, conceptId, storeId]);

  // Handle pagination changes separately (only when we have data and pagination actually changed)
  const prevPaginationRef = useRef({ concepts: conceptsPagination, stores: storesPagination });
  
  useEffect(() => {
    const prevConceptsPagination = prevPaginationRef.current.concepts;
    if (
      orgId && 
      concepts.length > 0 && 
      (conceptsPagination.page !== prevConceptsPagination.page || 
       conceptsPagination.pageSize !== prevConceptsPagination.pageSize)
    ) {
      console.log('Effect: Concepts pagination changed, fetching new page');
      fetchConcepts(orgId, conceptsPagination, setConceptsPagination, conceptId, storeId);
    }
    prevPaginationRef.current.concepts = conceptsPagination;
  }, [conceptsPagination.page, conceptsPagination.pageSize]);

  useEffect(() => {
    const prevStoresPagination = prevPaginationRef.current.stores;
    if (
      conceptId && 
      stores.length > 0 && 
      (storesPagination.page !== prevStoresPagination.page || 
       storesPagination.pageSize !== prevStoresPagination.pageSize)
    ) {
      console.log('Effect: Stores pagination changed, fetching new page');
      fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
    }
    prevPaginationRef.current.stores = storesPagination;
  }, [storesPagination.page, storesPagination.pageSize]);
}