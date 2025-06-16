import { useEffect } from 'react';
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
  
  // Fetch concepts when orgId is available (only once per unique combination)
  useEffect(() => {
    if (orgId) {
      console.log('Effect: Fetching concepts for orgId:', orgId);
      fetchConcepts(orgId, conceptsPagination, setConceptsPagination, conceptId, storeId);
    }
  }, [orgId]); // Only depend on orgId

  // Fetch stores when conceptId is available (only once per unique combination)
  useEffect(() => {
    if (conceptId) {
      console.log('Effect: Fetching stores for conceptId:', conceptId);
      fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
    }
  }, [conceptId]); // Only depend on conceptId

  // Fetch users when orgId is available (only once per unique combination)
  useEffect(() => {
    if (orgId) {
      console.log('Effect: Fetching users for orgId:', orgId, 'conceptId:', conceptId);
      fetchUsers(orgId, conceptId || undefined);
    }
  }, [orgId, conceptId]); // Depend on both orgId and conceptId since users can be filtered by concept

  // Handle pagination changes separately (only when we have existing data)
  useEffect(() => {
    if (orgId && concepts.length > 0 && (conceptsPagination.page > 1 || conceptsPagination.pageSize !== 10)) {
      console.log('Effect: Fetching concepts for pagination change');
      fetchConcepts(orgId, conceptsPagination, setConceptsPagination, conceptId, storeId);
    }
  }, [conceptsPagination.page, conceptsPagination.pageSize]);

  useEffect(() => {
    if (conceptId && stores.length > 0 && (storesPagination.page > 1 || storesPagination.pageSize !== 10)) {
      console.log('Effect: Fetching stores for pagination change');
      fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
    }
  }, [storesPagination.page, storesPagination.pageSize]);
}