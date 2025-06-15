
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/admin';

export function useUserRoles(userId?: string) {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserRoles = async (targetUserId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId);

      if (error) throw error;
      
      const roles = data?.map(item => item.role as UserRole) || [];
      setUserRoles(roles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRoles = async (targetUserId: string, newRoles: UserRole[]) => {
    try {
      // First, delete existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId);

      // Then insert new roles
      if (newRoles.length > 0) {
        const roleData = newRoles.map(role => ({
          user_id: targetUserId,
          role
        }));

        const { error } = await supabase
          .from('user_roles')
          .insert(roleData);

        if (error) throw error;
      }

      setUserRoles(newRoles);
      return true;
    } catch (error) {
      console.error('Error updating user roles:', error);
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserRoles(userId);
    }
  }, [userId]);

  return {
    userRoles,
    loading,
    updateUserRoles,
    refetchUserRoles: () => userId ? fetchUserRoles(userId) : null,
  };
}
