import React, { useEffect } from 'react';
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
    fetchConcepts,
    fetchStores,
    conceptsPagination,
    storesPagination,
    setConceptsPagination,
    setStoresPagination,
  } = useOrganizationData();

  // When we have a storeId but no store data, we need to fetch the data
  useEffect(() => {
    const handleDirectStoreNavigation = async () => {
      if (storeId && conceptId && orgId && stores.length === 0) {
        console.log('Direct store navigation detected, fetching data for storeId:', storeId);
        try {
          // First fetch concepts if we don't have them
          if (concepts.length === 0) {
            console.log('Fetching concepts for orgId:', orgId);
            await fetchConcepts(orgId, conceptsPagination, setConceptsPagination);
          }
          
          // Then fetch stores for the concept
          console.log('Fetching stores for conceptId:', conceptId);
          await fetchStores(conceptId, storesPagination, setStoresPagination, storeId);
        } catch (error) {
          console.error('Error fetching data for direct store navigation:', error);
        }
      }
    };

    handleDirectStoreNavigation();
  }, [storeId, conceptId, orgId, stores.length, concepts.length, fetchConcepts, fetchStores, conceptsPagination, storesPagination, setConceptsPagination, setStoresPagination]);

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
  if (storeId && !selectedStore) {
    console.log('Loading store data for storeId:', storeId);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading store...</div>
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
