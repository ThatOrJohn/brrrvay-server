
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { simpleHash } from '@/utils/passwordUtils';
import { NewUser } from '@/types/admin';

export function useUserManagement() {
  const { toast } = useToast();

  const handleAddUser = async (newUser: NewUser, orgId: string, conceptId: string, onRefreshUsers: (orgId: string) => void) => {
    if (!orgId || !conceptId || !newUser.selectedStores.length) return;

    try {
      console.log('Creating user with data:', {
        email: newUser.email,
        name: newUser.name,
        selectedStores: newUser.selectedStores,
        roles: newUser.roles,
        orgId,
        conceptId
      });

      const passwordHash = await simpleHash(newUser.password);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: newUser.email,
          name: newUser.name,
          role: 'store_user', // Keep for backward compatibility
          password_hash: passwordHash
        })
        .select()
        .single();

      if (userError) throw userError;
      console.log('Created user:', userData);

      // Create user roles
      if (newUser.roles && newUser.roles.length > 0) {
        const roleData = newUser.roles.map(role => ({
          user_id: userData.id,
          role
        }));

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert(roleData);

        if (roleError) throw roleError;
        console.log('Created user roles:', roleData);
      }

      const storeAccess = newUser.selectedStores.map(storeId => ({
        user_id: userData.id,
        organization_id: orgId,
        concept_id: conceptId,
        store_id: storeId
      }));

      console.log('Creating user access records:', storeAccess);

      const { data: accessData, error: accessError } = await supabase
        .from('user_access')
        .insert(storeAccess)
        .select();

      if (accessError) throw accessError;
      console.log('Created user access records:', accessData);

      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      console.log('Refreshing users list...');
      await onRefreshUsers(orgId);
    } catch (err) {
      console.error('Error creating user:', err);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  return {
    handleAddUser,
  };
}
