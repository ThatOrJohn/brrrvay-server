
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserStore {
  id: string;
  name: string;
}

interface UserStoresMap {
  [userId: string]: UserStore[];
}

export function useUserStores(userIds: string[]) {
  const [userStores, setUserStores] = useState<UserStoresMap>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userIds.length === 0) {
      setUserStores({});
      return;
    }

    const fetchUserStores = async () => {
      setLoading(true);
      try {
        // Get user access records with store information
        const { data: userAccess, error } = await supabase
          .from('user_access')
          .select(`
            user_id,
            store_id,
            stores (
              id,
              name
            )
          `)
          .in('user_id', userIds);

        if (error) throw error;

        // Group stores by user
        const storesMap: UserStoresMap = {};
        userAccess?.forEach((access) => {
          if (!storesMap[access.user_id]) {
            storesMap[access.user_id] = [];
          }
          if (access.stores) {
            storesMap[access.user_id].push({
              id: access.stores.id,
              name: access.stores.name,
            });
          }
        });

        setUserStores(storesMap);
      } catch (err) {
        console.error('Error fetching user stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStores();
  }, [userIds]);

  return { userStores, loading };
}
