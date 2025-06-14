
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useOrganizationManagement() {
  const { toast } = useToast();

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

  return {
    handleAddOrganization,
  };
}
