
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAgentManagement } from '@/hooks/useAgentManagement';
import { Agent, StoreAgent } from '@/types/agent';
import { supabase } from '@/integrations/supabase/client';
import { Monitor, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Store = {
  id: string;
  name: string;
  concept_id: string;
  external_id?: string;
};

type Concept = {
  id: string;
  name: string;
  organization_id: string;
};

type Organization = {
  id: string;
  name: string;
};

export default function AgentManagementPage() {
  const navigate = useNavigate();
  const { fetchAgents } = useAgentManagement();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedConcept, setSelectedConcept] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [agentsData, storesData, conceptsData, orgsData] = await Promise.all([
        fetchAgents(),
        supabase.from('stores').select('*').eq('is_active', true),
        supabase.from('concepts').select('*').eq('is_active', true),
        supabase.from('organizations').select('*').eq('is_active', true),
      ]);

      setAgents(agentsData);
      setStores(storesData.data || []);
      setConcepts(conceptsData.data || []);
      setOrganizations(orgsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.agent_key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredStores = stores.filter(store => {
    if (selectedConcept) {
      return store.concept_id === selectedConcept;
    }
    if (selectedOrg) {
      const concept = concepts.find(c => c.organization_id === selectedOrg);
      return concept && store.concept_id === concept.id;
    }
    return true;
  });

  const handleNavigateToStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      const concept = concepts.find(c => c.id === store.concept_id);
      if (concept) {
        navigate(`/admin/organizations/${concept.organization_id}/concepts/${concept.id}/stores/${storeId}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Agent Management</h1>
        <p className="text-gray-400">Manage agents across all organizations and stores</p>
      </div>

      {/* Filters */}
      <Card className="bg-[#1A1A1A] border-[#333333] mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Agents
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#2A2A2A] border-[#333333] text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization
              </label>
              <Select value={selectedOrg} onValueChange={(value) => {
                setSelectedOrg(value);
                setSelectedConcept('');
              }}>
                <SelectTrigger className="bg-[#2A2A2A] border-[#333333] text-white">
                  <SelectValue placeholder="All organizations" />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2A2A] border-[#333333]">
                  <SelectItem value="">All organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id} className="text-white">
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Concept
              </label>
              <Select value={selectedConcept} onValueChange={setSelectedConcept}>
                <SelectTrigger className="bg-[#2A2A2A] border-[#333333] text-white">
                  <SelectValue placeholder="All concepts" />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2A2A] border-[#333333]">
                  <SelectItem value="">All concepts</SelectItem>
                  {concepts
                    .filter(concept => !selectedOrg || concept.organization_id === selectedOrg)
                    .map((concept) => (
                      <SelectItem key={concept.id} value={concept.id} className="text-white">
                        {concept.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agents List */}
        <Card className="bg-[#1A1A1A] border-[#333333]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              All Agents ({filteredAgents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-gray-400">Loading agents...</div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-4 text-gray-400">No agents found</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 rounded-lg border border-[#333333] bg-[#2A2A2A]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{agent.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        agent.status === 'online' ? 'bg-green-500/20 text-green-400' :
                        agent.status === 'offline' ? 'bg-gray-500/20 text-gray-400' :
                        agent.status === 'error' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-mono">{agent.agent_key}</p>
                    {agent.description && (
                      <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stores List */}
        <Card className="bg-[#1A1A1A] border-[#333333]">
          <CardHeader>
            <CardTitle className="text-white">Stores ({filteredStores.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-gray-400">Loading stores...</div>
            ) : filteredStores.length === 0 ? (
              <div className="text-center py-4 text-gray-400">No stores found</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStores.map((store) => {
                  const concept = concepts.find(c => c.id === store.concept_id);
                  const organization = concept ? organizations.find(o => o.id === concept.organization_id) : null;
                  
                  return (
                    <div
                      key={store.id}
                      className="p-3 rounded-lg border border-[#333333] bg-[#2A2A2A] hover:bg-[#333333] transition-colors cursor-pointer"
                      onClick={() => handleNavigateToStore(store.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{store.name}</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          Manage Agents →
                        </Button>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>{organization?.name} → {concept?.name}</p>
                        {store.external_id && <p>ID: {store.external_id}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
