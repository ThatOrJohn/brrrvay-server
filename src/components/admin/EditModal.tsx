
import React, { useState, useEffect } from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { UserRole } from '@/types/admin';
import UserEditForm from './edit-modal/UserEditForm';
import StoreEditForm from './edit-modal/StoreEditForm';
import GenericEditForm from './edit-modal/GenericEditForm';
import ToggleActiveButton from './edit-modal/ToggleActiveButton';

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

interface EditModalProps {
  editState: EditState;
  item: any;
  onEditStateChange: (state: EditState) => void;
  onSave: () => void;
  onToggleActive?: (type: 'organization' | 'concept' | 'store' | 'user', id: string, currentStatus: boolean) => void;
}

export default function EditModal({
  editState,
  item,
  onEditStateChange,
  onSave,
  onToggleActive
}: EditModalProps) {
  const { userRoles, updateUserRoles } = useUserRoles(editState.type === 'user' ? editState.id : undefined);
  const [localRoles, setLocalRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    if (editState.type === 'user' && userRoles.length > 0) {
      setLocalRoles(userRoles);
      onEditStateChange({
        ...editState,
        data: { ...editState.data, roles: userRoles }
      });
    }
  }, [userRoles]);

  const handleSave = async () => {
    if (editState.type === 'user' && editState.id && localRoles.length > 0) {
      const success = await updateUserRoles(editState.id, localRoles);
      if (!success) {
        console.error('Failed to update user roles');
        return;
      }
    }
    onSave();
  };

  if (!editState.type || !editState.id || !item) return null;

  const renderForm = () => {
    switch (editState.type) {
      case 'user':
        return (
          <UserEditForm
            editState={editState}
            item={item}
            onEditStateChange={onEditStateChange}
          />
        );
      case 'store':
        return (
          <StoreEditForm
            editState={editState}
            item={item}
            onEditStateChange={onEditStateChange}
          />
        );
      default:
        return (
          <GenericEditForm
            editState={editState}
            item={item}
            onEditStateChange={onEditStateChange}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          Edit {editState.type}
        </h3>

        {renderForm()}

        <div className="flex justify-between gap-4 mt-6">
          <div>
            {onToggleActive && (
              <ToggleActiveButton
                editState={editState}
                item={item}
                onToggleActive={onToggleActive}
                onEditStateChange={onEditStateChange}
              />
            )}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => onEditStateChange({ type: null, id: null, data: {} })}
              className="px-4 py-2 text-[#666666] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
