
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useStoreManagement(selectedConcept: string | null) {
  const { toast } = useToast();

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
    handleAddStore,
  };
}
