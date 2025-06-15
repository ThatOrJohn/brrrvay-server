
import React from 'react';
import StoreDetails from '@/components/admin/StoreDetails';
import OrganizationBreadcrumbsContainer from './OrganizationBreadcrumbsContainer';
import { Organization, Concept, Store } from '@/types/admin';

interface OrganizationStoreViewProps {
  organizations: Organization[];
  concepts: Concept[];
  stores: Store[];
  selectedOrg: string | null;
  selectedConcept: string | null;
  storeId: string;
  selectedStore: Store;
}

export default function OrganizationStoreView({
  organizations,
  concepts,
  stores,
  selectedOrg,
  selectedConcept,
  storeId,
  selectedStore,
}: OrganizationStoreViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="mb-8">
        <OrganizationBreadcrumbsContainer
          organizations={organizations}
          concepts={concepts}
          stores={stores}
          selectedOrg={selectedOrg}
          selectedConcept={selectedConcept}
          storeId={storeId}
        />
      </div>
      
      <StoreDetails 
        store={selectedStore} 
        storeName={selectedStore.name}
      />
    </div>
  );
}
