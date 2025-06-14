
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Store, PaginationState } from '@/types/admin';

export function useStoresFetcher() {
  const [stores, setStores] = useState<Store[]>([]);

  const fetchStores = async (
    conceptId: string,
    storesPagination: PaginationState,
    setStoresPagination: (pagination: PaginationState) => void,
    storeId?: string | null
  ) => {
    try {
      const includeInactive = storeId;
      
      const countQuery = supabase
        .from('stores')
        .select('*', { count: 'exact', head: true })
        .eq('concept_id', conceptId);
      
      if (!includeInactive) {
        countQuery.eq('is_active', true);
      }
      
      const { count } = await countQuery;

      const dataQuery = supabase
        .from('stores')
        .select('*')
        .eq('concept_id', conceptId)
        .order('name')
        .range(
          (storesPagination.page - 1) * storesPagination.pageSize,
          storesPagination.page * storesPagination.pageSize - 1
        );
      
      if (!includeInactive) {
        dataQuery.eq('is_active', true);
      }
      
      const { data, error } = await dataQuery;
      
      if (error) throw error;
      setStores(data || []);
      setStoresPagination({ ...storesPagination, total: count || 0 });
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      throw new Error('Failed to fetch stores');
    }
  };

  return {
    stores,
    setStores,
    fetchStores,
  };
}
