
import React from 'react';
import { Plus } from 'lucide-react';
import { UserRole } from '@/types/admin';

interface UserFormProps {
  newUser: {
    email: string;
    name: string;
    password: string;
    selectedStores: string[];
    roles: UserRole[];
  };
  stores: Array<{
    id: string;
    name: string;
    concept_id: string;
    external_id: string | null;
    is_active: boolean;
  }>;
  onNewUserChange: (field: string, value: string | string[] | UserRole[]) => void;
  onAddUser: (e: React.FormEvent) => void;
}

const AVAILABLE_ROLES: UserRole[] = ['store_user', 'store_admin'];

export default function UserForm({ newUser, stores, onNewUserChange, onAddUser }: UserFormProps) {
  const handleRoleToggle = (role: UserRole) => {
    const currentRoles = newUser.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    onNewUserChange('roles', newRoles);
  };

  return (
    <div className="p-6 border-b border-[#333333]">
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
  );
}
