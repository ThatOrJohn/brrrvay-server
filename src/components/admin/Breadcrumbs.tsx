
import React from 'react';
import { Link } from 'react-router-dom';
import { Building } from 'lucide-react';

interface BreadcrumbsProps {
  selectedOrg: { id: string; name: string } | null;
  selectedConcept: { id: string; name: string } | null;
  selectedStore: { id: string; name: string } | null;
}

export default function Breadcrumbs({
  selectedOrg,
  selectedConcept,
  selectedStore
}: BreadcrumbsProps) {
  const crumbs = [];
  
  if (selectedOrg) {
    crumbs.push(
      <Link 
        key="org" 
        to={`/admin/organizations/${selectedOrg.id}`}
        className="text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        {selectedOrg.name}
      </Link>
    );
  }

  if (selectedConcept) {
    crumbs.push(
      <span key="sep1" className="mx-2 text-[#666666]">/</span>,
      <Link 
        key="concept"
        to={`/admin/organizations/${selectedOrg?.id}/concepts/${selectedConcept.id}`}
        className="text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        {selectedConcept.name}
      </Link>
    );
  }

  if (selectedStore) {
    crumbs.push(
      <span key="sep2" className="mx-2 text-[#666666]">/</span>,
      <span key="store" className="text-white">
        {selectedStore.name}
      </span>
    );
  }

  if (crumbs.length === 0) return null;

  return (
    <div className="mb-8 text-lg flex items-center">
      <Building className="w-5 h-5 mr-2 text-[#666666]" />
      {crumbs}
    </div>
  );
}
