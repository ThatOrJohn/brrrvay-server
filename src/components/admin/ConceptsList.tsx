
import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Edit2, Plus } from 'lucide-react';
import Pagination from './Pagination';

type Concept = {
  id: string;
  name: string;
  organization_id: string;
  is_active: boolean;
};

type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

interface ConceptsListProps {
  concepts: Concept[];
  selectedOrgId: string | null;
  selectedConceptId: string | null;
  newConceptName: string;
  onNewConceptNameChange: (name: string) => void;
  onAddConcept: (e: React.FormEvent) => void;
  onEditConcept: (concept: Concept) => void;
  pagination: PaginationState;
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
}

export default function ConceptsList({
  concepts,
  selectedOrgId,
  selectedConceptId,
  newConceptName,
  onNewConceptNameChange,
  onAddConcept,
  onEditConcept,
  pagination,
  onPaginationChange
}: ConceptsListProps) {
  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-[#333333]">
        <div className="flex items-center mb-4">
          <Layers className="w-5 h-5 mr-2 text-indigo-400" />
          <h2 className="text-xl font-semibold">Concepts</h2>
        </div>
        
        {selectedOrgId ? (
          <form onSubmit={onAddConcept} className="space-y-3">
            <input
              type="text"
              value={newConceptName}
              onChange={(e) => onNewConceptNameChange(e.target.value)}
              placeholder="New concept name"
              className="w-full rounded-lg bg-[#2A2A2A] border border-[#333333] text-white px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Concept
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-[#666666] text-sm">Select an organization first</p>
          </div>
        )}
      </div>

      <div className="flex flex-col h-[400px]">
        <div className="flex-1 overflow-y-auto p-6 pb-2">
          <div className="space-y-2">
            {concepts.map(concept => (
              <div key={concept.id} className="flex items-center gap-2 group">
                <Link
                  to={`/admin/organizations/${selectedOrgId}/concepts/${concept.id}`}
                  className={`flex-1 text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    selectedConceptId === concept.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'hover:bg-[#2A2A2A] text-[#999999] hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Layers className="w-4 h-4 mr-2 opacity-70" />
                    {concept.name}
                  </div>
                </Link>
                <button
                  onClick={() => onEditConcept(concept)}
                  className="p-2 text-[#666666] hover:text-white rounded-lg hover:bg-[#2A2A2A] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedOrgId && concepts.length > 0 && (
          <div className="border-t border-[#333333] bg-[#1A1A1A]">
            <Pagination
              pagination={pagination}
              setPagination={onPaginationChange}
              label="Concepts:"
            />
          </div>
        )}
      </div>
    </div>
  );
}
