
import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Edit2, Plus, Sparkles } from 'lucide-react';

type Organization = {
  id: string;
  name: string;
  created_at: string;
  trial_ends_at: string | null;
  is_active: boolean;
};

interface OrganizationsListProps {
  organizations: Organization[];
  selectedOrgId: string | null;
  newOrgName: string;
  onNewOrgNameChange: (name: string) => void;
  onAddOrganization: (e: React.FormEvent) => void;
  onEditOrganization: (org: Organization) => void;
}

export default function OrganizationsList({
  organizations,
  selectedOrgId,
  newOrgName,
  onNewOrgNameChange,
  onAddOrganization,
  onEditOrganization
}: OrganizationsListProps) {
  return (
    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#1F1F1F] border border-[#333333]/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:shadow-indigo-500/10 hover:border-indigo-500/30">
      {/* Enhanced header with gradient */}
      <div className="p-6 border-b border-[#333333]/50 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
        <div className="flex items-center mb-4 group">
          <div className="p-2 rounded-lg bg-indigo-500/20 mr-3 group-hover:bg-indigo-500/30 transition-colors duration-300">
            <Building className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300" />
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            Organizations
          </h2>
          <Sparkles className="w-4 h-4 ml-2 text-indigo-400 opacity-60 animate-pulse" />
        </div>
        
        <form onSubmit={onAddOrganization} className="space-y-3 group">
          <div className="relative">
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => onNewOrgNameChange(e.target.value)}
              placeholder="New organization name"
              className="w-full rounded-lg bg-[#2A2A2A]/80 border border-[#333333]/50 text-white px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 placeholder-gray-500 backdrop-blur-sm hover:bg-[#2A2A2A] focus:bg-[#2A2A2A]"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 transform hover:scale-[1.02] active:scale-[0.98] font-medium"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            Add Organization
          </button>
        </form>
      </div>

      <div className="flex flex-col h-[400px]">
        <div className="flex-1 overflow-y-auto p-6 pb-2 space-y-2">
          {organizations.map((org, index) => (
            <div 
              key={org.id} 
              className={`flex items-center gap-2 group transform transition-all duration-300 ${!org.is_active ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link
                to={`/admin/organizations/${org.id}`}
                className={`flex-1 text-left px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  selectedOrgId === org.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border-l-4 border-indigo-300'
                    : 'hover:bg-gradient-to-r hover:from-[#2A2A2A] hover:to-[#2F2F2F] text-[#999999] hover:text-white border border-transparent hover:border-indigo-500/20'
                } ${!org.is_active ? 'border border-red-500/30 hover:border-red-400/50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-1 rounded bg-white/10 mr-3">
                      <Building className="w-4 h-4 opacity-70" />
                    </div>
                    <span className="font-medium">{org.name}</span>
                  </div>
                  {!org.is_active && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30 animate-pulse">
                      Inactive
                    </span>
                  )}
                </div>
              </Link>
              <button
                onClick={() => onEditOrganization(org)}
                className="p-2 text-[#666666] hover:text-white rounded-lg hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-purple-500/20 transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110 active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {organizations.length === 0 && (
            <div className="text-center py-8 text-[#666666]">
              <Building className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No organizations yet</p>
              <p className="text-xs opacity-70">Create your first organization above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
