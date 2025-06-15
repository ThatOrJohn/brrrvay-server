
import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types/admin';
import { useUserRoles } from '@/hooks/useUserRoles';

type EditState = {
  type: 'organization' | 'concept' | 'store' | 'user' | null;
  id: string | null;
  data: {
    name?: string;
    email?: string;
    external_id?: string;
    password?: string;
    roles?: UserRole[];
  };
};

interface UserEditFormProps {
  editState: EditState;
  item: any;
  onEditStateChange: (state: EditState) => void;
}

const AVAILABLE_ROLES: UserRole[] = ['store_user', 'store_admin'];

export default function UserEditForm({ editState, item, onEditStateChange }: UserEditFormProps) {
  const { userRoles, loading } = useUserRoles(editState.type === 'user' ? editState.id : undefined);
  const [localRoles, setLocalRoles] = useState<UserRole[]>([]);

  // Initialize local roles when user roles are fetched
  useEffect(() => {
    if (editState.type === 'user' && userRoles.length >= 0 && !loading) {
      console.log('Initializing roles for user:', editState.id, 'with roles:', userRoles);
      setLocalRoles(userRoles);
      onEditStateChange({
        ...editState,
        data: { ...editState.data, roles: userRoles }
      });
    }
  }, [userRoles, loading, editState.id]);

  const handleRoleToggle = (role: UserRole) => {
    console.log('Toggling role:', role, 'current roles:', localRoles);
    const newRoles = localRoles.includes(role)
      ? localRoles.filter(r => r !== role)
      : [...localRoles, role];
    
    console.log('New roles after toggle:', newRoles);
    setLocalRoles(newRoles);
    onEditStateChange({
      ...editState,
      data: { ...editState.data, roles: newRoles }
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-[#666666] py-4">
          Loading user roles...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#666666] mb-1">
          Email
        </label>
        <input
          type="email"
          value={editState.data.email || item.email}
          onChange={(e) => onEditStateChange({
            ...editState,
            data: { ...editState.data, email: e.target.value }
          })}
          className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#666666] mb-1">
          Name
        </label>
        <input
          type="text"
          value={editState.data.name || item.name || ''}
          onChange={(e) => onEditStateChange({
            ...editState,
            data: { ...editState.data, name: e.target.value }
          })}
          className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#666666] mb-1">
          New Password (optional)
        </label>
        <input
          type="password"
          value={editState.data.password || ''}
          onChange={(e) => onEditStateChange({
            ...editState,
            data: { ...editState.data, password: e.target.value }
          })}
          className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#666666] mb-2">
          Roles
        </label>
        <div className="space-y-2">
          {AVAILABLE_ROLES.map(role => (
            <label key={role} className="flex items-center space-x-3 cursor-pointer hover:bg-[#333333] p-2 rounded">
              <input
                type="checkbox"
                checked={localRoles.includes(role)}
                onChange={() => handleRoleToggle(role)}
                className="rounded bg-[#1A1A1A] border-[#333333] text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-white text-sm">
                {role === 'store_user' ? 'Store User' : 'Store Admin'}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-2 text-xs text-[#666666]">
          Current roles: {localRoles.length > 0 ? localRoles.join(', ') : 'None'}
        </div>
      </div>
    </div>
  );
}
