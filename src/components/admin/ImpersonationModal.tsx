
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ImpersonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInternalUserId: string;
}

export default function ImpersonationModal({ isOpen, onClose, currentInternalUserId }: ImpersonationModalProps) {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find the external user by email
      const { data: externalUser, error: userError } = await supabase
        .from('users')
        .select('id, email, name, is_active')
        .eq('email', userEmail)
        .eq('is_active', true)
        .single();

      if (userError || !externalUser) {
        toast({
          title: "Error",
          description: "User not found or inactive",
          variant: "destructive",
        });
        return;
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', externalUser.id);

      if (rolesError) {
        toast({
          title: "Error",
          description: "Error fetching user permissions",
          variant: "destructive",
        });
        return;
      }

      const roles = userRoles?.map(r => r.role) || [];

      // Log the impersonation event
      const { error: impersonationError } = await supabase
        .from('impersonation_events')
        .insert({
          internal_user_id: currentInternalUserId,
          impersonated_user_id: externalUser.id,
          started_at: new Date().toISOString()
        });

      if (impersonationError) {
        console.error('Error logging impersonation:', impersonationError);
      }

      // Store user info in localStorage for the dashboard
      localStorage.setItem('currentUser', JSON.stringify({
        ...externalUser,
        roles
      }));

      // Store impersonation info
      localStorage.setItem('impersonationData', JSON.stringify({
        internalUserId: currentInternalUserId,
        startTime: new Date().toISOString()
      }));

      toast({
        title: "Success",
        description: `Now impersonating ${externalUser.email}`,
      });

      // Navigate to external user dashboard
      navigate('/dashboard');
      onClose();
    } catch (error) {
      console.error('Error during impersonation:', error);
      toast({
        title: "Error",
        description: "Failed to impersonate user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Impersonate External User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userEmail">User Email</Label>
            <Input
              id="userEmail"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter external user email"
              required
              className="mt-1"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Starting...' : 'Start Impersonation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
