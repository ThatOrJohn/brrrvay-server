
import React from 'react';
import OrganizationsList from '@/components/admin/OrganizationsList';
import ConceptsList from '@/components/admin/ConceptsList';
import StoresList from '@/components/admin/StoresList';
import UsersList from '@/components/admin/UsersList';
import { Organization, Concept, Store, User, PaginationState, NewUser } from '@/types/admin';

interface OrganizationManagementGridProps {
  organizations: Organization[];
  concepts: Concept[];
  stores: Store[];
  users: User[];
  selectedOrgId: string | null;
  selectedConceptId: string | null;
  selectedStoreId: string | null;
  conceptsPagination: PaginationState;
  storesPagination: PaginationState;
  newOrgName: string;
  newConceptName: string;
  newStoreName: string;
  newStoreExternalId: string;
  newUser: NewUser;
  onNewOrgNameChange: (value: string) => void;
  onNewConceptNameChange: (value: string) => void;
  onNewStoreNameChange: (value: string) => void;
  onNewStoreExternalIdChange: (value: string) => void;
  onNewUserChange: (field: string, value: string | string[]) => void;
  onAddOrganization: (e: React.FormEvent) => void;
  onAddConcept: (e: React.FormEvent) => void;
  onAddStore: (e: React.FormEvent) => void;
  onAddUser: (e: React.FormEvent) => void;
  onEditOrganization: (org: Organization) => void;
  onEditConcept: (concept: Concept) => void;
  onEditStore: (store: Store) => void;
  onEditUser: (user: User) => void;
  onConceptsPaginationChange: (pagination: PaginationState) => void;
  onStoresPaginationChange: (pagination: PaginationState) => void;
}

export default function OrganizationManagementGrid({
  organizations,
  concepts,
  stores,
  users,
  selectedOrgId,
  selectedConceptId,
  selectedStoreId,
  conceptsPagination,
  storesPagination,
  newOrgName,
  newConceptName,
  newStoreName,
  newStoreExternalId,
  newUser,
  onNewOrgNameChange,
  onNewConceptNameChange,
  onNewStoreNameChange,
  onNewStoreExternalIdChange,
  onNewUserChange,
  onAddOrganization,
  onAddConcept,
  onAddStore,
  onAddUser,
  onEditOrganization,
  onEditConcept,
  onEditStore,
  onEditUser,
  onConceptsPaginationChange,
  onStoresPaginationChange,
}: OrganizationManagementGridProps) {
  // Get selected organization data
  const selectedOrg = selectedOrgId ? organizations.find(org => org.id === selectedOrgId) : null;

  return (
    <div className="space-y-8">
      {/* Enhanced grid with stagger animation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <OrganizationsList
            organizations={organizations}
            selectedOrgId={selectedOrgId}
            newOrgName={newOrgName}
            onNewOrgNameChange={onNewOrgNameChange}
            onAddOrganization={onAddOrganization}
            onEditOrganization={onEditOrganization}
          />
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <ConceptsList
            concepts={concepts}
            selectedOrgId={selectedOrgId}
            selectedConceptId={selectedConceptId}
            newConceptName={newConceptName}
            onNewConceptNameChange={onNewConceptNameChange}
            onAddConcept={onAddConcept}
            onEditConcept={onEditConcept}
            pagination={conceptsPagination}
            onPaginationChange={onConceptsPaginationChange}
          />
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <StoresList
            stores={stores}
            selectedOrgId={selectedOrgId}
            selectedConceptId={selectedConceptId}
            selectedStoreId={selectedStoreId}
            newStoreName={newStoreName}
            newStoreExternalId={newStoreExternalId}
            onNewStoreNameChange={onNewStoreNameChange}
            onNewStoreExternalIdChange={onNewStoreExternalIdChange}
            onAddStore={onAddStore}
            onEditStore={onEditStore}
            pagination={storesPagination}
            onPaginationChange={onStoresPaginationChange}
          />
        </div>
      </div>

      {selectedOrgId && (
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <UsersList
            users={users}
            stores={stores}
            newUser={newUser}
            onNewUserChange={onNewUserChange}
            onAddUser={onAddUser}
            onEditUser={onEditUser}
            organizationId={selectedOrgId}
            organizationName={selectedOrg?.name}
          />
        </div>
      )}
    </div>
  );
}
