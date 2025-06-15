
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ImpersonationData {
  internalUserId: string;
  startTime: string;
}

export function useImpersonation() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonationData, setImpersonationData] = useState<ImpersonationData | null>(null);

  useEffect(() => {
    const checkImpersonation = () => {
      const storedData = localStorage.getItem('impersonationData');
      if (storedData) {
        const data = JSON.parse(storedData);
        setImpersonationData(data);
        setIsImpersonating(true);
      }
    };

    checkImpersonation();
  }, []);

  const stopImpersonation = async () => {
    if (!impersonationData) return;

    try {
      // Log the end of impersonation
      const { error } = await supabase
        .from('impersonation_events')
        .update({ ended_at: new Date().toISOString() })
        .eq('internal_user_id', impersonationData.internalUserId)
        .eq('started_at', impersonationData.startTime)
        .is('ended_at', null);

      if (error) {
        console.error('Error ending impersonation:', error);
      }
    } catch (error) {
      console.error('Error during stop impersonation:', error);
    }

    // Clear storage and state
    localStorage.removeItem('impersonationData');
    localStorage.removeItem('currentUser');
    setImpersonationData(null);
    setIsImpersonating(false);

    // Navigate back to admin
    window.location.href = '/admin/dashboard';
  };

  return {
    isImpersonating,
    impersonationData,
    stopImpersonation
  };
}
