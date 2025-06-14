
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useConceptManagement(selectedOrg: string | null) {
  const { toast } = useToast();

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

  return {
    handleAddConcept,
  };
}
