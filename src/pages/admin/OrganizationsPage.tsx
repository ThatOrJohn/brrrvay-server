import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import OrganizationStoreView from '@/components/admin/organization-page/OrganizationStoreView';
import OrganizationMainView from '@/components/admin/organization-page/OrganizationMainView';

export default function OrganizationsPage() {
  const { orgId, conceptId, storeId } = useParams();
  
  const {
    organizations,
    selectedOrg,
    concepts,
    selectedConcept,
    stores,
  } = useOrganizationData();

  // Get selected store data
  const selectedStore = storeId ? stores.find(s => s.id === storeId) : null;

  // If a store is selected, show the store details page
  if (storeId && selectedStore) {
    return (
      <OrganizationStoreView
        organizations={organizations}
        concepts={concepts}
        stores={stores}
        selectedOrg={selectedOrg}
        selectedConcept={selectedConcept}
        storeId={storeId}
        selectedStore={selectedStore}
      />
    );
  }

  // Otherwise show the main organization management view
  return (
    <OrganizationMainView
      orgId={orgId || null}
      conceptId={conceptId || null}
      storeId={storeId || null}
    />
  );
}
