
import React from 'react';

type EditState = {
  type: 'organization' | 'concept' | 'store' | 'user' | null;
  id: string | null;
  data: {
    name?: string;
    email?: string;
    external_id?: string;
    password?: string;
    roles?: any[];
  };
};

interface StoreEditFormProps {
  editState: EditState;
  item: any;
  onEditStateChange: (state: EditState) => void;
}

export default function StoreEditForm({ editState, item, onEditStateChange }: StoreEditFormProps) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}
