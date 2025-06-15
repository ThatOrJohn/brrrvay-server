
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/admin';

export function useUserRoles(userId?: string) {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserRoles = async (targetUserId: string) => {
    setLoading(true);
    try {
      console.log('Fetching roles for user:', targetUserId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId);

      if (error) throw error;
      
      const roles = data?.map(item => item.role as UserRole) || [];
      console.log('Fetched roles:', roles);
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
      console.log('Updating roles for user:', targetUserId, 'to:', newRoles);
      
      // First, delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId);

      if (deleteError) {
        console.error('Error deleting existing roles:', deleteError);
        throw deleteError;
      }

      // Then insert new roles
      if (newRoles.length > 0) {
        const roleData = newRoles.map(role => ({
          user_id: targetUserId,
          role
        }));

        console.log('Inserting new roles:', roleData);
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(roleData);

        if (insertError) {
          console.error('Error inserting new roles:', insertError);
          throw insertError;
        }
      }

      console.log('Roles updated successfully');
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
    } else {
      setUserRoles([]);
    }
  }, [userId]);

  return {
    userRoles,
    loading,
    updateUserRoles,
    refetchUserRoles: () => userId ? fetchUserRoles(userId) : null,
  };
}
