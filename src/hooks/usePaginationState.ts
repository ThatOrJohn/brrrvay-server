
import { useState } from 'react';
import { PaginationState } from '@/types/admin';

export function usePaginationState() {
  const [conceptsPagination, setConceptsPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const [storesPagination, setStoresPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  return {
    conceptsPagination,
    storesPagination,
    setConceptsPagination,
    setStoresPagination,
  };
}
