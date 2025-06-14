
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { simpleHash } from '@/utils/passwordUtils';
import { EditState } from '@/types/admin';

interface UseEntityEditorProps {
  selectedOrg: string | null;
  selectedConcept: string | null;
  onRefreshOrganizations: () => void;
  onRefreshConcepts: (orgId: string) => void;
  onRefreshStores: (conceptId: string) => void;
  onRefreshUsers: (orgId: string) => void;
}

export function useEntityEditor({
  selectedOrg,
  selectedConcept,
  onRefreshOrganizations,
  onRefreshConcepts,
  onRefreshStores,
  onRefreshUsers,
}: UseEntityEditorProps) {
  const { toast } = useToast();

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

  return {
    handleEdit,
  };
}
