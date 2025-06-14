
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseEntityActionsProps {
  onRefresh: () => void;
}

export function useEntityActions({ onRefresh }: UseEntityActionsProps) {
  const { toast } = useToast();

  const handleToggleActive = async (
    tableName: string,
    id: string,
    currentStatus: boolean,
    entityType: string
  ) => {
    try {
      await supabase
        .from(tableName)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      onRefresh();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: `Failed to toggle ${entityType} status`,
        variant: "destructive",
      });
    }
  };

  return {
    handleToggleActive,
  };
}
