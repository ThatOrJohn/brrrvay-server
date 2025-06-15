
import { useState } from 'react';
import { EditState, NewUser, UserRole } from '@/types/admin';

export function useOrganizationPageState() {
  const [editState, setEditState] = useState<EditState>({
    type: null,
    id: null,
    data: {}
  });

  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    name: '',
    password: '',
    selectedStores: [],
    roles: ['store_user']
  });

  const [newOrgName, setNewOrgName] = useState('');
  const [newConceptName, setNewConceptName] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreExternalId, setNewStoreExternalId] = useState('');

  const handleNewUserChange = (field: string, value: string | string[] | UserRole[]) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  const resetNewUser = () => {
    setNewUser({
      email: '',
      name: '',
      password: '',
      selectedStores: [],
      roles: ['store_user']
    });
  };

  const resetEditState = () => {
    setEditState({ type: null, id: null, data: {} });
  };

  return {
    editState,
    setEditState,
    newUser,
    setNewUser,
    newOrgName,
    setNewOrgName,
    newConceptName,
    setNewConceptName,
    newStoreName,
    setNewStoreName,
    newStoreExternalId,
    setNewStoreExternalId,
    handleNewUserChange,
    resetNewUser,
    resetEditState,
  };
}
