
import React from 'react';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import { Organization, Concept, Store } from '@/types/admin';

interface OrganizationBreadcrumbsContainerProps {
  organizations: Organization[];
  concepts: Concept[];
  stores: Store[];
  selectedOrg: string | null;
  selectedConcept: string | null;
  storeId: string | null;
}

export default function OrganizationBreadcrumbsContainer({
  organizations,
  concepts,
  stores,
  selectedOrg,
  selectedConcept,
  storeId,
}: OrganizationBreadcrumbsContainerProps) {
  const getBreadcrumbData = () => {
    const selectedOrgData = selectedOrg ? organizations.find(o => o.id === selectedOrg) : null;
    const selectedConceptData = selectedConcept ? concepts.find(c => c.id === selectedConcept) : null;
    const selectedStoreData = storeId ? stores.find(s => s.id === storeId) : null;

    return {
      selectedOrg: selectedOrgData ? { id: selectedOrgData.id, name: selectedOrgData.name } : null,
      selectedConcept: selectedConceptData ? { id: selectedConceptData.id, name: selectedConceptData.name } : null,
      selectedStore: selectedStoreData ? { id: selectedStoreData.id, name: selectedStoreData.name } : null,
    };
  };

  return (
    <div className="transform transition-all duration-300">
      <Breadcrumbs {...getBreadcrumbData()} />
    </div>
  );
}
