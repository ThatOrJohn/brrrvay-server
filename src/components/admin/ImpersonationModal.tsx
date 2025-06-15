
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Search, User, X } from 'lucide-react';

interface ImpersonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInternalUserId: string;
  preselectedEmail?: string;
}

interface UserSearchResult {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
}

export default function ImpersonationModal({ 
  isOpen, 
  onClose, 
  currentInternalUserId,
  preselectedEmail 
}: ImpersonationModalProps) {
  const [searchTerm, setSearchTerm] = useState(preselectedEmail || '');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Search for users as user types
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('id, email, name, is_active')
          .eq('is_active', true)
          .ilike('email', `%${searchTerm}%`)
          .order('email')
          .limit(10);

        if (error) throw error;
        setSearchResults(users || []);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // If preselected email is provided, select that user
  useEffect(() => {
    if (preselectedEmail && searchResults.length > 0) {
      const user = searchResults.find(u => u.email === preselectedEmail);
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [preselectedEmail, searchResults]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);

    try {
      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', selectedUser.id);

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
          impersonated_user_id: selectedUser.id,
          started_at: new Date().toISOString()
        });

      if (impersonationError) {
        console.error('Error logging impersonation:', impersonationError);
      }

      // Store user info in localStorage for the dashboard
      localStorage.setItem('currentUser', JSON.stringify({
        ...selectedUser,
        roles
      }));

      // Store impersonation info
      localStorage.setItem('impersonationData', JSON.stringify({
        internalUserId: currentInternalUserId,
        startTime: new Date().toISOString()
      }));

      toast({
        title: "Success",
        description: `Now impersonating ${selectedUser.email}`,
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

  const handleReset = () => {
    setSearchTerm('');
    setSelectedUser(null);
    setSearchResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Impersonate External User
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="userSearch" className="text-sm font-medium text-gray-700">
              Search User by Email
            </Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="userSearch"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search for users..."
                className="pl-10 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Search Results */}
          {searchTerm.length >= 2 && (
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
              {searching ? (
                <div className="p-3 text-center text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1 p-2">
                  {searchResults.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className={`w-full p-2 text-left rounded flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                        selectedUser?.id === user.id ? 'bg-indigo-50 border border-indigo-200' : ''
                      }`}
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{user.email}</div>
                        {user.name && (
                          <div className="text-sm text-gray-500">{user.name}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-gray-500">No users found</div>
              )}
            </div>
          )}

          {/* Selected User */}
          {selectedUser && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-indigo-900">Selected User:</div>
                  <div className="text-indigo-700">{selectedUser.email}</div>
                  {selectedUser.name && (
                    <div className="text-sm text-indigo-600">{selectedUser.name}</div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedUser}
              className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Impersonation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
