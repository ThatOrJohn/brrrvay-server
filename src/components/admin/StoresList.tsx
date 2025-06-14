
import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Edit2, Plus } from 'lucide-react';
import Pagination from './Pagination';

type StoreType = {
  id: string;
  name: string;
  concept_id: string;
  external_id: string | null;
  is_active: boolean;
};

type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

interface StoresListProps {
  stores: StoreType[];
  selectedOrgId: string | null;
  selectedConceptId: string | null;
  selectedStoreId: string | null;
  newStoreName: string;
  newStoreExternalId: string;
  onNewStoreNameChange: (name: string) => void;
  onNewStoreExternalIdChange: (id: string) => void;
  onAddStore: (e: React.FormEvent) => void;
  onEditStore: (store: StoreType) => void;
  pagination: PaginationState;
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
}

export default function StoresList({
  stores,
  selectedOrgId,
  selectedConceptId,
  selectedStoreId,
  newStoreName,
  newStoreExternalId,
  onNewStoreNameChange,
  onNewStoreExternalIdChange,
  onAddStore,
  onEditStore,
  pagination,
  onPaginationChange
}: StoresListProps) {
  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-[#333333]">
        <div className="flex items-center mb-4">
          <Store className="w-5 h-5 mr-2 text-indigo-400" />
          <h2 className="text-xl font-semibold">Stores</h2>
        </div>
        
        {selectedConceptId ? (
          <form onSubmit={onAddStore} className="space-y-3">
            <input
              type="text"
              value={newStoreName}
              onChange={(e) => onNewStoreNameChange(e.target.value)}
              placeholder="Store name"
              className="w-full rounded-lg bg-[#2A2A2A] border border-[#333333] text-white px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <input
              type="text"
              value={newStoreExternalId}
              onChange={(e) => onNewStoreExternalIdChange(e.target.value)}
              placeholder="External ID (optional)"
              className="w-full rounded-lg bg-[#2A2A2A] border border-[#333333] text-white px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Store
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-[#666666] text-sm">Select a concept first</p>
          </div>
        )}
      </div>

      <div className="flex flex-col h-[400px]">
        <div className="flex-1 overflow-y-auto p-6 pb-2">
          <div className="space-y-2">
            {stores.map(store => (
              <div key={store.id} className={`flex items-center gap-2 group ${!store.is_active ? 'opacity-60' : ''}`}>
                <Link
                  to={`/admin/organizations/${selectedOrgId}/concepts/${selectedConceptId}/stores/${store.id}`}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    selectedStoreId === store.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
                  } ${!store.is_active ? 'border border-red-500/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Store className="w-4 h-4 mr-2 opacity-70" />
                      <span className="font-medium">{store.name}</span>
                    </div>
                    {!store.is_active && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  {store.external_id && (
                    <div className="text-sm text-[#666666] ml-6">
                      ID: {store.external_id}
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => onEditStore(store)}
                  className="p-2 text-[#666666] hover:text-white rounded-lg hover:bg-[#2A2A2A] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedConceptId && stores.length > 0 && (
          <div className="border-t border-[#333333] bg-[#1A1A1A]">
            <Pagination
              pagination={pagination}
              setPagination={onPaginationChange}
              label="Stores:"
            />
          </div>
        )}
      </div>
    </div>
  );
}
