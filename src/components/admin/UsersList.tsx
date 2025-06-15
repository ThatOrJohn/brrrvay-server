
import React from 'react';
import { User, Edit2, Plus, Eye, EyeOff } from 'lucide-react';
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

type StoreType = {
  id: string;
  name: string;
  concept_id: string;
  external_id: string | null;
  is_active: boolean;
};

interface UsersListProps {
  users: UserType[];
  stores: StoreType[];
  newUser: {
    email: string;
    name: string;
    password: string;
    selectedStores: string[];
    roles: UserRole[];
  };
  onNewUserChange: (field: string, value: string | string[] | UserRole[]) => void;
  onAddUser: (e: React.FormEvent) => void;
  onEditUser: (user: UserType) => void;
}

const AVAILABLE_ROLES: UserRole[] = ['store_user', 'store_admin'];

export default function UsersList({
  users,
  stores,
  newUser,
  onNewUserChange,
  onAddUser,
  onEditUser
}: UsersListProps) {
  const handleRoleToggle = (role: UserRole) => {
    const currentRoles = newUser.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    onNewUserChange('roles', newRoles);
  };

  const formatRoles = (roles: UserRole[] | undefined) => {
    if (!roles || roles.length === 0) return 'No roles';
    return roles.map(role => 
      role === 'store_user' ? 'Store User' : 'Store Admin'
    ).join(', ');
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg">
      <div className="p-6 border-b border-[#333333]">
        <div className="flex items-center mb-6">
          <User className="w-5 h-5 mr-2 text-indigo-400" />
          <h2 className="text-xl font-semibold">Store Users</h2>
        </div>

        <form onSubmit={onAddUser} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#999999] mb-2">
                Email
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => onNewUserChange('email', e.target.value)}
                className="w-full rounded-lg bg-[#2A2A2A] border border-[#333333] text-white px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#999999] mb-2">
                Name
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => onNewUserChange('name', e.target.value)}
                className="w-full rounded-lg bg-[#2A2A2A] border border-[#333333] text-white px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#999999] mb-2">
                Password
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => onNewUserChange('password', e.target.value)}
                className="w-full rounded-lg bg-[#2A2A2A] border border-[#333333] text-white px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#999999] mb-2">
                Roles
              </label>
              <div className="space-y-2">
                {AVAILABLE_ROLES.map(role => (
                  <label key={role} className="flex items-center space-x-3 cursor-pointer hover:bg-[#333333] p-2 rounded">
                    <input
                      type="checkbox"
                      checked={newUser.roles?.includes(role) || false}
                      onChange={() => handleRoleToggle(role)}
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

          <div>
            <label className="block text-sm font-medium text-[#999999] mb-2">
              Accessible Stores
            </label>
            <div className="bg-[#2A2A2A] border border-[#333333] rounded-lg p-4 max-h-[200px] overflow-y-auto">
              <div className="space-y-3">
                {stores.map(store => (
                  <label key={store.id} className="flex items-center space-x-3 cursor-pointer hover:bg-[#333333] p-2 rounded">
                    <input
                      type="checkbox"
                      checked={newUser.selectedStores.includes(store.id)}
                      onChange={(e) => {
                        const storeId = store.id;
                        const newSelectedStores = e.target.checked
                          ? [...newUser.selectedStores, storeId]
                          : newUser.selectedStores.filter(id => id !== storeId);
                        onNewUserChange('selectedStores', newSelectedStores);
                      }}
                      className="rounded bg-[#1A1A1A] border-[#333333] text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-white text-sm">{store.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Store User
            </button>
          </div>
        </form>
      </div>

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
                    <button
                      onClick={() => onEditUser(user)}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
