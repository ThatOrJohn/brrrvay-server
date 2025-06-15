
import React from 'react';
import { Edit2, Eye, EyeOff, Store, UserCheck } from 'lucide-react';
import { UserRole } from '@/types/admin';

type UserType = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password_hash: string | null;
  created_at: string;
  is_active: boolean;
  roles?: UserRole[];
};

interface UsersTableProps {
  users: UserType[];
  onEditUser: (user: UserType) => void;
  onManageStores: (user: UserType) => void;
  onImpersonateUser?: (user: UserType) => void;
}

export default function UsersTable({ 
  users, 
  onEditUser, 
  onManageStores, 
  onImpersonateUser 
}: UsersTableProps) {
  const formatRoles = (roles: UserRole[] | undefined) => {
    if (!roles || roles.length === 0) return 'No roles';
    return roles.map(role => 
      role === 'store_user' ? 'Store User' : 'Store Admin'
    ).join(', ');
  };

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-[#333333]">
              <th className="pb-3 font-medium text-[#999999]">Email</th>
              <th className="pb-3 font-medium text-[#999999]">Name</th>
              <th className="pb-3 font-medium text-[#999999]">Roles</th>
              <th className="pb-3 font-medium text-[#999999]">Status</th>
              <th className="pb-3 font-medium text-[#999999]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={`border-b border-[#333333] hover:bg-[#2A2A2A] transition-colors ${
                !user.is_active ? 'opacity-60' : ''
              }`}>
                <td className="py-4 text-white">{user.email}</td>
                <td className="py-4 text-[#999999]">{user.name || '-'}</td>
                <td className="py-4">
                  <span className="px-2 py-1 bg-[#2A2A2A] text-[#999999] rounded text-xs font-medium">
                    {formatRoles(user.roles)}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    {user.is_active ? (
                      <Eye className="w-4 h-4 text-green-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-xs font-medium ${
                      user.is_active ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditUser(user)}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onManageStores(user)}
                      className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Store className="w-4 h-4" />
                      Stores
                    </button>
                    {onImpersonateUser && user.is_active && (
                      <button
                        onClick={() => onImpersonateUser(user)}
                        className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        Impersonate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
