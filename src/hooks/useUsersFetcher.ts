
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/admin';

export function useUsersFetcher() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async (organizationId: string) => {
    try {
      console.log('Fetching users for organization:', organizationId);
      
      const { data: concepts, error: conceptsError } = await supabase
        .from('concepts')
        .select('id')
        .eq('organization_id', organizationId);

      if (conceptsError) throw conceptsError;
      console.log('Found concepts:', concepts);

      if (!concepts?.length) {
        console.log('No concepts found for organization');
        setUsers([]);
        return;
      }

      const { data: orgStores, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .in('concept_id', concepts.map(c => c.id));

      if (storesError) throw storesError;
      console.log('Found stores:', orgStores);

      if (!orgStores?.length) {
        console.log('No stores found for concepts');
        setUsers([]);
        return;
      }

      const { data: userAccess, error: accessError } = await supabase
        .from('user_access')
        .select('user_id, store_id, organization_id, concept_id')
        .in('store_id', orgStores.map(s => s.id));

      if (accessError) throw accessError;
      console.log('Found user access records:', userAccess);

      if (!userAccess?.length) {
        console.log('No user access records found');
        setUsers([]);
        return;
      }

      const userIds = [...new Set(userAccess.map(ua => ua.user_id))];
      console.log('Unique user IDs:', userIds);

      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds)
        .order('email');

      if (error) throw error;
      console.log('Fetched users:', users);
      setUsers(users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      throw new Error('Failed to fetch users');
    }
  };

  return {
    users,
    setUsers,
    fetchUsers,
  };
}
