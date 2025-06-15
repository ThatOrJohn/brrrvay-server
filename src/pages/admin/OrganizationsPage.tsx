
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import OrganizationStoreView from '@/components/admin/organization-page/OrganizationStoreView';
import OrganizationMainView from '@/components/admin/organization-page/OrganizationMainView';

export default function OrganizationsPage() {
  const { orgId, conceptId, storeId } = useParams();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'settings';
  
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
    console.log('Rendering OrganizationStoreView with tab:', tab);
    return (
      <OrganizationStoreView
        organizations={organizations}
        concepts={concepts}
        stores={stores}
        selectedOrg={selectedOrg}
        selectedConcept={selectedConcept}
        storeId={storeId}
        selectedStore={selectedStore}
        initialTab={tab as "settings" | "agents"}
      />
    );
  }

  // If we have a storeId but no selectedStore yet (still loading), show loading state
  if (storeId && !selectedStore && stores.length === 0) {
    console.log('Loading store data for storeId:', storeId);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading store...</div>
      </div>
    );
  }

  // If we have a storeId but the store wasn't found in the loaded stores
  if (storeId && !selectedStore && stores.length > 0) {
    console.log('Store not found:', storeId, 'Available stores:', stores.map(s => s.id));
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400">Store not found</div>
      </div>
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
