
import React from 'react';
import OrganizationPageHeader from './OrganizationPageHeader';
import OrganizationBreadcrumbsContainer from './OrganizationBreadcrumbsContainer';
import OrganizationManagementGrid from './OrganizationManagementGrid';
import EditModal from '@/components/admin/EditModal';
import { Organization, Concept, Store, User, PaginationState, EditState, NewUser } from '@/types/admin';

interface OrganizationPageLayoutProps {
  organizations: Organization[];
  concepts: Concept[];
  stores: Store[];
  users: User[];
  selectedOrg: string | null;
  selectedConcept: string | null;
  orgId: string | null;
  conceptId: string | null;
  storeId: string | null;
  conceptsPagination: PaginationState;
  storesPagination: PaginationState;
  editState: EditState;
  newOrgName: string;
  newConceptName: string;
  newStoreName: string;
  newStoreExternalId: string;
  newUser: NewUser;
  error: string | null;
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
  onEditStateChange: (editState: EditState) => void;
  onEdit: () => void;
  onToggleActive: (type: 'organization' | 'concept' | 'store' | 'user', id: string, currentStatus: boolean) => void;
  getCurrentEditItem: () => any;
}

export default function OrganizationPageLayout({
  organizations,
  concepts,
  stores,
  users,
  selectedOrg,
  selectedConcept,
  orgId,
  conceptId,
  storeId,
  conceptsPagination,
  storesPagination,
  editState,
  newOrgName,
  newConceptName,
  newStoreName,
  newStoreExternalId,
  newUser,
  error,
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
  onEditStateChange,
  onEdit,
  onToggleActive,
  getCurrentEditItem,
}: OrganizationPageLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-8 animate-fade-in">
      <OrganizationPageHeader />
      
      <OrganizationBreadcrumbsContainer
        organizations={organizations}
        concepts={concepts}
        stores={stores}
        selectedOrg={selectedOrg}
        selectedConcept={selectedConcept}
        storeId={storeId}
      />

      {error && (
        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl p-4 mb-8 text-sm text-red-400 flex items-center animate-scale-in backdrop-blur-sm">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-3 flex-shrink-0 animate-pulse"></div>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <OrganizationManagementGrid
        organizations={organizations}
        concepts={concepts}
        stores={stores}
        users={users}
        selectedOrgId={orgId}
        selectedConceptId={conceptId}
        selectedStoreId={storeId}
        conceptsPagination={conceptsPagination}
        storesPagination={storesPagination}
        newOrgName={newOrgName}
        newConceptName={newConceptName}
        newStoreName={newStoreName}
        newStoreExternalId={newStoreExternalId}
        newUser={newUser}
        onNewOrgNameChange={onNewOrgNameChange}
        onNewConceptNameChange={onNewConceptNameChange}
        onNewStoreNameChange={onNewStoreNameChange}
        onNewStoreExternalIdChange={onNewStoreExternalIdChange}
        onNewUserChange={onNewUserChange}
        onAddOrganization={onAddOrganization}
        onAddConcept={onAddConcept}
        onAddStore={onAddStore}
        onAddUser={onAddUser}
        onEditOrganization={onEditOrganization}
        onEditConcept={onEditConcept}
        onEditStore={onEditStore}
        onEditUser={onEditUser}
        onConceptsPaginationChange={onConceptsPaginationChange}
        onStoresPaginationChange={onStoresPaginationChange}
      />

      <EditModal
        editState={editState}
        item={getCurrentEditItem()}
        onEditStateChange={onEditStateChange}
        onSave={onEdit}
        onToggleActive={onToggleActive}
      />
    </div>
  );
}
