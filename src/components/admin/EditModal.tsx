
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type EditState = {
  type: 'organization' | 'concept' | 'store' | 'user' | null;
  id: string | null;
  data: {
    name?: string;
    email?: string;
    external_id?: string;
    password?: string;
  };
};

interface EditModalProps {
  editState: EditState;
  item: any;
  onEditStateChange: (state: EditState) => void;
  onSave: () => void;
  onToggleActive?: (type: 'organization' | 'concept' | 'store', id: string, currentStatus: boolean) => void;
}

export default function EditModal({
  editState,
  item,
  onEditStateChange,
  onSave,
  onToggleActive
}: EditModalProps) {
  if (!editState.type || !editState.id || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          Edit {editState.type}
        </h3>

        <div className="space-y-4">
          {editState.type === 'user' ? (
            <>
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
            </>
          ) : editState.type === 'store' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editState.data.name || item.name}
                  onChange={(e) => onEditStateChange({
                    ...editState,
                    data: { ...editState.data, name: e.target.value }
                  })}
                  className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">
                  External ID
                </label>
                <input
                  type="text"
                  value={editState.data.external_id || item.external_id || ''}
                  onChange={(e) => onEditStateChange({
                    ...editState,
                    data: { ...editState.data, external_id: e.target.value }
                  })}
                  className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white px-3 py-2"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[#666666] mb-1">
                Name
              </label>
              <input
                type="text"
                value={editState.data.name || item.name}
                onChange={(e) => onEditStateChange({
                  ...editState,
                  data: { ...editState.data, name: e.target.value }
                })}
                className="w-full rounded-lg bg-[#2A2A2A] border-[#333333] text-white px-3 py-2"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4 mt-6">
          <div>
            {editState.type !== 'user' && onToggleActive && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {item.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#1A1A1A] border-[#333333]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      {item.is_active ? 'Deactivate' : 'Activate'} {editState.type}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[#666666]">
                      Are you sure you want to {item.is_active ? 'deactivate' : 'activate'} this {editState.type}? 
                      {item.is_active && ' This will hide it from standard searches.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-[#2A2A2A] text-white border-[#333333] hover:bg-[#3A3A3A]">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onToggleActive(editState.type as 'organization' | 'concept' | 'store', editState.id!, item.is_active);
                        onEditStateChange({ type: null, id: null, data: {} });
                      }}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      {item.is_active ? 'Deactivate' : 'Activate'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
              onClick={onSave}
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
