import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { simpleHash } from '@/utils/passwordUtils';
import { EditState, NewUser } from '@/types/admin';

interface UseOrganizationActionsProps {
  selectedOrg: string | null;
  selectedConcept: string | null;
  onRefreshOrganizations: () => void;
  onRefreshConcepts: (orgId: string) => void;
  onRefreshStores: (conceptId: string) => void;
  onRefreshUsers: (orgId: string) => void;
}

export function useOrganizationActions({
  selectedOrg,
  selectedConcept,
  onRefreshOrganizations,
  onRefreshConcepts,
  onRefreshStores,
  onRefreshUsers,
}: UseOrganizationActionsProps) {
  const { toast } = useToast();

  const handleToggleActive = async (
    type: 'organization' | 'concept' | 'store' | 'user',
    id: string,
    currentStatus: boolean
  ) => {
    try {
      const tableName = type === 'organization' ? 'organizations' : 
                       type === 'concept' ? 'concepts' : 
                       type === 'store' ? 'stores' : 'users';
      
      await supabase
        .from(tableName)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      switch (type) {
        case 'organization':
          onRefreshOrganizations();
          break;
        case 'concept':
          if (selectedOrg) onRefreshConcepts(selectedOrg);
          break;
        case 'store':
          if (selectedConcept) onRefreshStores(selectedConcept);
          break;
        case 'user':
          if (selectedOrg) onRefreshUsers(selectedOrg);
          break;
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: `Failed to toggle ${type} status`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (editState: EditState, organizations: any[], concepts: any[], stores: any[], users: any[]) => {
    if (!editState.type || !editState.id) return;

    try {
      switch (editState.type) {
        case 'organization':
          await supabase
            .from('organizations')
            .update({ name: editState.data.name })
            .eq('id', editState.id);
          onRefreshOrganizations();
          break;

        case 'concept':
          await supabase
            .from('concepts')
            .update({ name: editState.data.name })
            .eq('id', editState.id);
          if (selectedOrg) onRefreshConcepts(selectedOrg);
          break;

        case 'store':
          await supabase
            .from('stores')
            .update({
              name: editState.data.name,
              external_id: editState.data.external_id
            })
            .eq('id', editState.id);
          if (selectedConcept) onRefreshStores(selectedConcept);
          break;

        case 'user':
          const updates: any = {
            name: editState.data.name,
            email: editState.data.email
          };

          if (editState.data.password) {
            updates.password_hash = await simpleHash(editState.data.password);
          }

          await supabase
            .from('users')
            .update(updates)
            .eq('id', editState.id);
          if (selectedOrg) onRefreshUsers(selectedOrg);
          break;
      }

      toast({
        title: "Success",
        description: `${editState.type} updated successfully`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: `Failed to update ${editState.type}`,
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async (newUser: NewUser, orgId: string, conceptId: string) => {
    if (!orgId || !conceptId || !newUser.selectedStores.length) return;

    try {
      console.log('Creating user with data:', {
        email: newUser.email,
        name: newUser.name,
        selectedStores: newUser.selectedStores,
        orgId,
        conceptId
      });

      const passwordHash = await simpleHash(newUser.password);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: newUser.email,
          name: newUser.name,
          role: 'store_user',
          password_hash: passwordHash
        })
        .select()
        .single();

      if (userError) throw userError;
      console.log('Created user:', userData);

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

  const handleAddOrganization = async (name: string, organizations: any[], setOrganizations: any) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      setOrganizations([...organizations, data]);
      
      toast({
        title: "Success",
        description: "Organization created successfully",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to add organization",
        variant: "destructive",
      });
    }
  };

  const handleAddConcept = async (name: string, concepts: any[], setConcepts: any) => {
    if (!selectedOrg) return;

    try {
      const { data, error } = await supabase
        .from('concepts')
        .insert([{
          name,
          organization_id: selectedOrg
        }])
        .select()
        .single();
      
      if (error) throw error;
      setConcepts([...concepts, data]);
      
      toast({
        title: "Success",
        description: "Concept created successfully",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to add concept",
        variant: "destructive",
      });
    }
  };

  const handleAddStore = async (name: string, externalId: string, stores: any[], setStores: any) => {
    if (!selectedConcept) return;

    try {
      const { data, error } = await supabase
        .from('stores')
        .insert([{
          name,
          external_id: externalId || null,
          concept_id: selectedConcept
        }])
        .select()
        .single();
      
      if (error) throw error;
      setStores([...stores, data]);
      
      toast({
        title: "Success",
        description: "Store created successfully",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to add store",
        variant: "destructive",
      });
    }
  };

  return {
    handleToggleActive,
    handleEdit,
    handleAddUser,
    handleAddOrganization,
    handleAddConcept,
    handleAddStore,
  };
}
