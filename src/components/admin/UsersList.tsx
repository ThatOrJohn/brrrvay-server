
import React, { useState } from 'react';
import { UserRole } from '@/types/admin';
import UserStoreMapping from './UserStoreMapping';
import UsersListHeader from './users-list/UsersListHeader';
import UserForm from './users-list/UserForm';
import UsersTable from './users-list/UsersTable';

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

export default function UsersList({
  users,
  stores,
  newUser,
  onNewUserChange,
  onAddUser,
  onEditUser
}: UsersListProps) {
  const [mappingUser, setMappingUser] = useState<UserType | null>(null);

  const handleSaveStoreMapping = () => {
    setMappingUser(null);
    // Trigger a refresh of the users list - this could be passed as a prop
    window.location.reload(); // Simple approach for now
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg">
      <div className="p-6 border-b border-[#333333]">
        <UsersListHeader />
        <UserForm
          newUser={newUser}
          stores={stores}
          onNewUserChange={onNewUserChange}
          onAddUser={onAddUser}
        />
      </div>

      <UsersTable
        users={users}
        onEditUser={onEditUser}
        onManageStores={setMappingUser}
      />

      {mappingUser && (
        <UserStoreMapping
          user={mappingUser}
          stores={stores}
          onClose={() => setMappingUser(null)}
          onSave={handleSaveStoreMapping}
        />
      )}
    </div>
  );
}
