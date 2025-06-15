
import React from 'react';
import { Organization, Concept, Store, NewUser } from '@/types/admin';

interface OrganizationFormHandlersProps {
  newOrgName: string;
  newConceptName: string;
  newStoreName: string;
  newStoreExternalId: string;
  newUser: NewUser;
  orgId: string | null;
  conceptId: string | null;
  organizations: Organization[];
  concepts: Concept[];
  stores: Store[];
  setNewOrgName: (name: string) => void;
  setNewConceptName: (name: string) => void;
  setNewStoreName: (name: string) => void;
  setNewStoreExternalId: (id: string) => void;
  resetNewUser: () => void;
  handleAddOrganization: (name: string, orgs: Organization[], setOrgs: (orgs: Organization[]) => void) => Promise<void>;
  handleAddConcept: (name: string, concepts: Concept[], setConcepts: (concepts: Concept[]) => void) => Promise<void>;
  handleAddStore: (name: string, externalId: string, stores: Store[], setStores: (stores: Store[]) => void) => Promise<void>;
  handleAddUser: (user: NewUser, orgId: string, conceptId: string) => Promise<void>;
  setOrganizations: (orgs: Organization[]) => void;
  setConcepts: (concepts: Concept[]) => void;
  setStores: (stores: Store[]) => void;
}

export function useOrganizationFormHandlers({
  newOrgName,
  newConceptName,
  newStoreName,
  newStoreExternalId,
  newUser,
  orgId,
  conceptId,
  organizations,
  concepts,
  stores,
  setNewOrgName,
  setNewConceptName,
  setNewStoreName,
  setNewStoreExternalId,
  resetNewUser,
  handleAddOrganization,
  handleAddConcept,
  handleAddStore,
  handleAddUser,
  setOrganizations,
  setConcepts,
  setStores,
}: OrganizationFormHandlersProps) {
  const onAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddOrganization(newOrgName, organizations, setOrganizations);
    setNewOrgName('');
  };

  const onAddConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddConcept(newConceptName, concepts, setConcepts);
    setNewConceptName('');
  };

  const onAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddStore(newStoreName, newStoreExternalId, stores, setStores);
    setNewStoreName('');
    setNewStoreExternalId('');
  };

  const onAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orgId && conceptId) {
      await handleAddUser(newUser, orgId, conceptId);
      resetNewUser();
    }
  };

  return {
    onAddOrganization,
    onAddConcept,
    onAddStore,
    onAddUser,
  };
}
