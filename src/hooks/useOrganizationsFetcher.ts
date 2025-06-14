
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/types/admin';

export function useOrganizationsFetcher() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setOrganizations(data || []);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      throw new Error('Failed to fetch organizations');
    }
  };

  return {
    organizations,
    setOrganizations,
    fetchOrganizations,
  };
}
