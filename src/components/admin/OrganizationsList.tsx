
import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Edit2, Plus } from 'lucide-react';

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
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-[#333333]">
        <div className="flex items-center mb-4">
          <Building className="w-5 h-5 mr-2 text-indigo-400" />
          <h2 className="text-xl font-semibold">Organizations</h2>
        </div>
        
        <form onSubmit={onAddOrganization} className="space-y-3">
          <input
            type="text"
            value={newOrgName}
            onChange={(e) => onNewOrgNameChange(e.target.value)}
            placeholder="New organization name"
            className="w-full rounded-lg bg-[#2A2A2A] border border-[#333333] text-white px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Organization
          </button>
        </form>
      </div>

      <div className="flex flex-col h-[400px]">
        <div className="flex-1 overflow-y-auto p-6 pb-2">
          <div className="space-y-2">
            {organizations.map(org => (
              <div key={org.id} className="flex items-center gap-2 group">
                <Link
                  to={`/admin/organizations/${org.id}`}
                  className={`flex-1 text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    selectedOrgId === org.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'hover:bg-[#2A2A2A] text-[#999999] hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 opacity-70" />
                    {org.name}
                  </div>
                </Link>
                <button
                  onClick={() => onEditOrganization(org)}
                  className="p-2 text-[#666666] hover:text-white rounded-lg hover:bg-[#2A2A2A] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
