
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Edit2, Plus, MapPin, Settings, Monitor } from 'lucide-react';
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
  const navigate = useNavigate();

  const handleGoToStoreTab = (
    store: StoreType,
    tab: "settings" | "agents"
  ) => {
    if (selectedOrgId && selectedConceptId) {
      navigate(
        `/admin/organizations/${selectedOrgId}/concepts/${selectedConceptId}/stores/${store.id}?tab=${tab}`
      );
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#1F1F1F] border border-[#333333]/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-green-500/10 hover:border-green-500/30">
      {/* Enhanced header */}
      <div className="p-6 border-b border-[#333333]/50 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
        <div className="flex items-center mb-4 group">
          <div className="p-2 rounded-lg bg-green-500/20 mr-3 group-hover:bg-green-500/30 transition-colors duration-300">
            <Store className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
            Stores
          </h2>
          <MapPin className="w-4 h-4 ml-2 text-green-400 opacity-60 animate-pulse" />
        </div>
        
        {selectedConceptId ? (
          <form onSubmit={onAddStore} className="space-y-3 group">
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => onNewStoreNameChange(e.target.value)}
                  placeholder="Store name"
                  className="w-full rounded-lg bg-[#2A2A2A]/80 border border-[#333333]/50 text-white px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 placeholder-gray-500 backdrop-blur-sm hover:bg-[#2A2A2A] focus:bg-[#2A2A2A]"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={newStoreExternalId}
                  onChange={(e) => onNewStoreExternalIdChange(e.target.value)}
                  placeholder="External ID (optional)"
                  className="w-full rounded-lg bg-[#2A2A2A]/80 border border-[#333333]/50 text-white px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 placeholder-gray-500 backdrop-blur-sm hover:bg-[#2A2A2A] focus:bg-[#2A2A2A]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all duration-300 shadow-lg hover:shadow-green-500/25 transform hover:scale-[1.02] active:scale-[0.98] font-medium"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
              Add Store
            </button>
          </form>
        ) : (
          <div className="text-center py-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
            <Store className="w-8 h-8 mx-auto mb-2 text-yellow-400 opacity-70" />
            <p className="text-yellow-400 text-sm font-medium">Select a concept first</p>
            <p className="text-yellow-300/70 text-xs mt-1">Choose a concept to manage stores</p>
          </div>
        )}
      </div>

      <div className="flex flex-col h-[400px]">
        <div className="flex-1 overflow-y-auto p-6 pb-2">
          <div className="space-y-2">
            {stores.map((store, index) => (
              <div 
                key={store.id}
                className={`flex items-center gap-2 group transform transition-all duration-300 ${!store.is_active ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`flex-1 px-4 py-3 rounded-lg transition-all duration-300 transform ${
                    selectedStoreId === store.id
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25 border-l-4 border-green-300'
                      : 'bg-[#2A2A2A]/50 text-white hover:bg-gradient-to-r hover:from-[#2A2A2A] hover:to-[#2F2F2F] border border-transparent hover:border-green-500/20'
                  } ${!store.is_active ? 'border border-red-500/30 hover:border-red-400/50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="p-1 rounded bg-white/10 mr-3">
                        <Store className="w-4 h-4 opacity-70" />
                      </div>
                      <span className="font-medium">{store.name}</span>
                    </div>
                    {!store.is_active && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30 animate-pulse">
                        Inactive
                      </span>
                    )}
                  </div>
                  {store.external_id && (
                    <div className="text-sm text-[#888888] ml-6 opacity-80">
                      ID: {store.external_id}
                    </div>
                  )}
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1 pr-2">
                  <button
                    title="Store Settings"
                    onClick={() => handleGoToStoreTab(store, "settings")}
                    className="p-2 text-indigo-500 hover:bg-indigo-600/10 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    title="Agent Management"
                    onClick={() => handleGoToStoreTab(store, "agents")}
                    className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditStore(store)}
                    className="p-2 text-[#666666] hover:text-white rounded-lg hover:bg-gradient-to-r hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {stores.length === 0 && selectedConceptId && (
              <div className="text-center py-8 text-[#666666]">
                <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No stores yet</p>
                <p className="text-xs opacity-70">Create your first store above</p>
              </div>
            )}
          </div>
        </div>

        {selectedConceptId && stores.length > 0 && (
          <div className="border-t border-[#333333]/50 bg-gradient-to-r from-[#1A1A1A] to-[#1F1F1F]">
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
