
import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, NewUser } from '@/types/admin';
import UserForm from './users-list/UserForm';
import UsersListHeader from './users-list/UsersListHeader';
import UsersTable from './users-list/UsersTable';
import UserStoreManagementModal from './UserStoreManagementModal';
import ImpersonationModal from './ImpersonationModal';

type StoreType = {
  id: string;
  name: string;
  concept_id: string;
  external_id: string | null;
  is_active: boolean;
};

interface UsersListProps {
  users: User[];
  stores: StoreType[];
  newUser: NewUser;
  onNewUserChange: (field: string, value: string | string[]) => void;
  onAddUser: (e: React.FormEvent) => void;
  onEditUser: (user: User) => void;
  organizationId?: string;
  organizationName?: string;
}

export default function UsersList({
  users,
  stores,
  newUser,
  onNewUserChange,
  onAddUser,
  onEditUser,
  organizationId,
  organizationName
}: UsersListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [userStoreModal, setUserStoreModal] = useState<User | null>(null);
  const [impersonationModal, setImpersonationModal] = useState<User | null>(null);

  const handleManageStores = (user: User) => {
    setUserStoreModal(user);
  };

  const handleImpersonateUser = (user: User) => {
    setImpersonationModal(user);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    onAddUser(e);
    setShowAddForm(false);
  };

  // Get current internal user ID (this should come from auth context in a real app)
  const currentInternalUserId = 'temp-internal-user-id';

  return (
    <div className="space-y-6">
      <Card className="bg-[#1A1A1A] border-[#333333]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              External Users ({users.length})
            </CardTitle>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {showAddForm && (
            <div className="border-b border-[#333333] bg-[#2A2A2A]">
              <UserForm
                stores={stores}
                newUser={newUser}
                onNewUserChange={onNewUserChange}
                onAddUser={handleAddUserSubmit}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}

          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
              <p className="text-sm">Add users to get started</p>
            </div>
          ) : (
            <UsersTable
              users={users}
              onEditUser={onEditUser}
              onManageStores={handleManageStores}
              onImpersonateUser={handleImpersonateUser}
            />
          )}
        </CardContent>
      </Card>

      {/* User Store Management Modal */}
      {userStoreModal && organizationId && organizationName && (
        <UserStoreManagementModal
          user={userStoreModal}
          organizationId={organizationId}
          organizationName={organizationName}
          onClose={() => setUserStoreModal(null)}
          onSave={() => {
            setUserStoreModal(null);
            // Optionally refresh users list here
          }}
        />
      )}

      {/* Impersonation Modal */}
      {impersonationModal && (
        <ImpersonationModal
          isOpen={!!impersonationModal}
          onClose={() => setImpersonationModal(null)}
          currentInternalUserId={currentInternalUserId}
          preselectedEmail={impersonationModal.email}
        />
      )}
    </div>
  );
}
