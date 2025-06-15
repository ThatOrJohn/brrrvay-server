
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
    roles?: any[];
  };
};

interface ToggleActiveButtonProps {
  editState: EditState;
  item: any;
  onToggleActive: (type: 'organization' | 'concept' | 'store' | 'user', id: string, currentStatus: boolean) => void;
  onEditStateChange: (state: EditState) => void;
}

export default function ToggleActiveButton({ editState, item, onToggleActive, onEditStateChange }: ToggleActiveButtonProps) {
  return (
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
              onToggleActive(editState.type as 'organization' | 'concept' | 'store' | 'user', editState.id!, item.is_active);
              onEditStateChange({ type: null, id: null, data: {} });
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {item.is_active ? 'Deactivate' : 'Activate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
