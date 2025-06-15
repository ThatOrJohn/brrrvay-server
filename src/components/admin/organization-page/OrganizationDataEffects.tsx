
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
  // Use refs to track previous values and prevent infinite loops
  const prevOrgIdRef = useRef<string | null>(null);
  const prevConceptIdRef = useRef<string | null>(null);
  const hasConceptsRef = useRef(false);
  const hasStoresRef = useRef(false);

  // Only fetch concepts when orgId actually changes and we don't have concepts yet
  useEffect(() => {
    if (orgId && orgId !== prevOrgIdRef.current && !hasConceptsRef.current) {
      console.log('Fetching concepts for new orgId:', orgId);
      fetchConcepts(orgId, conceptsPagination, setConceptsPagination, conceptId, storeId);
      prevOrgIdRef.current = orgId;
      hasConceptsRef.current = true;
    }
  }, [orgId]);

  // Only fetch stores when conceptId actually changes and we don't have stores yet
  useEffect(() => {
    if (conceptId && conceptId !== prevConceptIdRef.current && !hasStoresRef.current) {
      console.log('Fetching stores for new conceptId:', conceptId);
      fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
      prevConceptIdRef.current = conceptId;
      hasStoresRef.current = true;
    }
  }, [conceptId]);

  // Reset refs when navigation changes
  useEffect(() => {
    if (!orgId) {
      hasConceptsRef.current = false;
      prevOrgIdRef.current = null;
    }
  }, [orgId]);

  useEffect(() => {
    if (!conceptId) {
      hasStoresRef.current = false;
      prevConceptIdRef.current = null;
    }
  }, [conceptId]);

  // Fetch concepts when pagination changes (only if we have an orgId and already have some concepts)
  useEffect(() => {
    if (orgId && hasConceptsRef.current && concepts.length > 0) {
      console.log('Fetching concepts for pagination change');
      fetchConcepts(orgId, conceptsPagination, setConceptsPagination, conceptId, storeId);
    }
  }, [conceptsPagination.page, conceptsPagination.pageSize]);

  // Fetch stores when pagination changes (only if we have a conceptId and already have some stores)
  useEffect(() => {
    if (conceptId && hasStoresRef.current && stores.length > 0) {
      console.log('Fetching stores for pagination change');
      fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
    }
  }, [storesPagination.page, storesPagination.pageSize]);

  // Only fetch users when orgId or conceptId changes
  useEffect(() => {
    if (orgId) {
      console.log('Fetching users for orgId:', orgId, 'conceptId:', conceptId);
      fetchUsers(orgId, conceptId || undefined);
    }
  }, [orgId, conceptId]);
}
