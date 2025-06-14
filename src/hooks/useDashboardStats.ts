
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DashboardStats = {
  totalOrganizations: number;
  activeOrganizations: number;
  totalConcepts: number;
  totalStores: number;
  totalUsers: number;
  activeTrials: number;
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalConcepts: 0,
    totalStores: 0,
    totalUsers: 0,
    activeTrials: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch organizations stats
        const { data: orgs, error: orgsError } = await supabase
          .from('organizations')
          .select('is_active');
        
        if (orgsError) throw orgsError;

        // Fetch concepts count
        const { count: conceptsCount, error: conceptsError } = await supabase
          .from('concepts')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        
        if (conceptsError) throw conceptsError;

        // Fetch stores count
        const { count: storesCount, error: storesError } = await supabase
          .from('stores')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        
        if (storesError) throw storesError;

        // Fetch users count
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        
        if (usersError) throw usersError;

        // Fetch active trials
        const { count: trialsCount, error: trialsError } = await supabase
          .from('trials')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        
        if (trialsError) throw trialsError;

        const totalOrganizations = orgs?.length || 0;
        const activeOrganizations = orgs?.filter(org => org.is_active).length || 0;

        setStats({
          totalOrganizations,
          activeOrganizations,
          totalConcepts: conceptsCount || 0,
          totalStores: storesCount || 0,
          totalUsers: usersCount || 0,
          activeTrials: trialsCount || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
