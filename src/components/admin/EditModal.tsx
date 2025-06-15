
import React, { useState, useEffect } from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { UserRole } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { simpleHash } from '@/utils/passwordUtils';
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
  const { updateUserRoles } = useUserRoles(editState.type === 'user' ? editState.id : undefined);
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editState.type || !editState.id) return;

    setSaving(true);
    try {
      console.log('Saving edit state:', editState);

      // Handle user role updates first
      if (editState.type === 'user' && editState.data.roles) {
        console.log('Updating user roles to:', editState.data.roles);
        const success = await updateUserRoles(editState.id, editState.data.roles);
        if (!success) {
          throw new Error('Failed to update user roles');
        }
        console.log('User roles updated successfully');
      }

      // Prepare update data for the main table
      const updateData: any = {};
      if (editState.data.name !== undefined) updateData.name = editState.data.name;
      if (editState.data.email !== undefined) updateData.email = editState.data.email;
      if (editState.data.external_id !== undefined) updateData.external_id = editState.data.external_id;

      // Handle password update for users
      if (editState.type === 'user' && editState.data.password && editState.data.password.trim()) {
        console.log('Updating user password');
        updateData.password_hash = await simpleHash(editState.data.password);
      }

      // Update the main table if there are changes
      if (Object.keys(updateData).length > 0) {
        const tableName = editState.type === 'organization' ? 'organizations' : 
                         editState.type === 'concept' ? 'concepts' : 
                         editState.type === 'store' ? 'stores' : 'users';

        console.log('Updating table:', tableName, 'with data:', updateData);

        const { error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', editState.id);

        if (error) throw error;
        console.log('Main table updated successfully');
      }

      toast({
        title: "Success",
        description: `${editState.type} updated successfully`,
      });

      onSave();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: `Failed to update ${editState.type}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
        <h3 className="text-xl font-semibold mb-4 text-white">
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
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
