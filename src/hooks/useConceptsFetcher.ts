
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Concept, PaginationState } from '@/types/admin';

export function useConceptsFetcher() {
  const [concepts, setConcepts] = useState<Concept[]>([]);

  const fetchConcepts = async (
    orgId: string, 
    conceptsPagination: PaginationState,
    setConceptsPagination: (pagination: PaginationState) => void,
    conceptId?: string | null,
    storeId?: string | null
  ) => {
    try {
      const includeInactive = conceptId || storeId;
      
      const countQuery = supabase
        .from('concepts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      
      if (!includeInactive) {
        countQuery.eq('is_active', true);
      }
      
      const { count } = await countQuery;

      const dataQuery = supabase
        .from('concepts')
        .select('*')
        .eq('organization_id', orgId)
        .order('name')
        .range(
          (conceptsPagination.page - 1) * conceptsPagination.pageSize,
          conceptsPagination.page * conceptsPagination.pageSize - 1
        );
      
      if (!includeInactive) {
        dataQuery.eq('is_active', true);
      }
      
      const { data, error } = await dataQuery;
      
      if (error) throw error;
      setConcepts(data || []);
      setConceptsPagination({ ...conceptsPagination, total: count || 0 });
    } catch (err) {
      console.error('Failed to fetch concepts:', err);
      throw new Error('Failed to fetch concepts');
    }
  };

  return {
    concepts,
    setConcepts,
    fetchConcepts,
  };
}
