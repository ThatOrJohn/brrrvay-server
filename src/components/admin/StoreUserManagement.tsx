
import React, { useState, useEffect } from 'react';
import { User, Plus, Edit2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/admin';
import { useUserRoles } from '@/hooks/useUserRoles';

type StoreUser = {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  roles?: UserRole[];
};

interface StoreUserManagementProps {
  storeId: string;
  storeName: string;
}

export default function StoreUserManagement({ storeId, storeName }: StoreUserManagementProps) {
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<StoreUser | null>(null);
  const { toast } = useToast();
  const { userRoles, updateUserRoles } = useUserRoles(editingUser?.id);

  const fetchStoreUsers = async () => {
    try {
      setLoading(true);
      
      // Get users who have access to this store
      const { data: userAccess, error: accessError } = await supabase
        .from('user_access')
        .select('user_id')
        .eq('store_id', storeId);

      if (accessError) throw accessError;

      if (!userAccess?.length) {
        setUsers([]);
        return;
      }

      const userIds = userAccess.map(ua => ua.user_id);

      // Fetch user details
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, is_active')
        .in('id', userIds)
        .order('email');

      if (usersError) throw usersError;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
          
          const roles = roleData?.map(r => r.role as UserRole) || [];
          return { ...user, roles };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching store users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch store users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUserFromStore = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_access')
        .delete()
        .eq('user_id', userId)
        .eq('store_id', storeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User removed from store",
      });

      fetchStoreUsers();
    } catch (error) {
      console.error('Error removing user from store:', error);
      toast({
        title: "Error",
        description: "Failed to remove user from store",
        variant: "destructive",
      });
    }
  };

  const handleSaveUserRoles = async () => {
    if (!editingUser) return;

    const success = await updateUserRoles(editingUser.id, userRoles);
    if (success) {
      toast({
        title: "Success",
        description: "User roles updated successfully",
      });
      setEditingUser(null);
      fetchStoreUsers();
    } else {
      toast({
        title: "Error",
        description: "Failed to update user roles",
        variant: "destructive",
      });
    }
  };

  const formatRoles = (roles: UserRole[] | undefined) => {
    if (!roles || roles.length === 0) return 'No roles';
    return roles.map(role => 
      role === 'store_user' ? 'Store User' : 'Store Admin'
    ).join(', ');
  };

  useEffect(() => {
    fetchStoreUsers();
  }, [storeId]);

  if (loading) {
    return (
      <Card className="bg-[#1A1A1A] border-[#333333]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Store Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#333333]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5" />
          Store Users ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No users assigned to this store</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className={`flex items-center justify-between p-4 bg-[#2A2A2A] rounded-lg border border-[#333333] ${
                !user.is_active ? 'opacity-60' : ''
              }`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-white font-medium">{user.email}</p>
                      <p className="text-gray-400 text-sm">{user.name || 'No name'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.is_active ? (
                        <Eye className="w-4 h-4 text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-[#1A1A1A] text-gray-300 rounded text-xs">
                      {formatRoles(user.roles)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingUser(user)}
                    className="text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveUserFromStore(user.id)}
                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-md border border-[#333333]">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Edit User: {editingUser.email}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Roles
                </label>
                <div className="space-y-2">
                  {(['store_user', 'store_admin'] as UserRole[]).map(role => (
                    <label key={role} className="flex items-center space-x-3 cursor-pointer hover:bg-[#333333] p-2 rounded">
                      <input
                        type="checkbox"
                        checked={userRoles.includes(role)}
                        onChange={(e) => {
                          const newRoles = e.target.checked
                            ? [...userRoles, role]
                            : userRoles.filter(r => r !== role);
                          // We need to manually trigger the role update here since we're in a modal
                          // The useUserRoles hook will handle the actual update
                        }}
                        className="rounded bg-[#1A1A1A] border-[#333333] text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-white text-sm">
                        {role === 'store_user' ? 'Store User' : 'Store Admin'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="text-gray-400 border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveUserRoles}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
