
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type SearchResult = {
  type: 'organization' | 'concept' | 'store' | 'user';
  id: string;
  name: string;
  details?: string;
  is_active?: boolean;
  organization_id?: string;
  concept_id?: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const navigate = useNavigate();

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300); // Wait 300ms after last keystroke before searching

    return () => clearTimeout(timeoutId);
  }, [query, showInactive]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Search organizations
      const orgQuery = supabase
        .from('organizations')
        .select('id, name, is_active')
        .ilike('name', `%${query}%`)
        .limit(5);
      
      if (!showInactive) {
        orgQuery.eq('is_active', true);
      }
      
      const { data: orgs } = await orgQuery;

      // Search concepts
      const conceptQuery = supabase
        .from('concepts')
        .select('id, name, organization_id, is_active')
        .ilike('name', `%${query}%`)
        .limit(5);
      
      if (!showInactive) {
        conceptQuery.eq('is_active', true);
      }
      
      const { data: concepts } = await conceptQuery;

      // Search stores
      const storeQuery = supabase
        .from('stores')
        .select('id, name, concept_id, is_active')
        .ilike('name', `%${query}%`)
        .limit(5);
      
      if (!showInactive) {
        storeQuery.eq('is_active', true);
      }
      
      const { data: stores } = await storeQuery;

      // Search users
      const userQuery = supabase
        .from('users')
        .select('id, email, name, role, is_active')
        .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(5);
      
      if (!showInactive) {
        userQuery.eq('is_active', true);
      }
      
      const { data: users } = await userQuery;

      const searchResults: SearchResult[] = [
        ...(orgs?.map(org => ({
          type: 'organization' as const,
          id: org.id,
          name: org.name,
          is_active: org.is_active,
        })) || []),
        ...(concepts?.map(concept => ({
          type: 'concept' as const,
          id: concept.id,
          name: concept.name,
          details: `Organization: ${concept.organization_id}`,
          is_active: concept.is_active,
          organization_id: concept.organization_id,
        })) || []),
        ...(stores?.map(store => ({
          type: 'store' as const,
          id: store.id,
          name: store.name,
          details: `Concept: ${store.concept_id}`,
          is_active: store.is_active,
          concept_id: store.concept_id,
        })) || []),
        ...(users?.map(user => ({
          type: 'user' as const,
          id: user.id,
          name: user.name || user.email,
          details: `Role: ${user.role}`,
          is_active: user.is_active,
        })) || []),
      ];

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (result: SearchResult) => {
    switch (result.type) {
      case 'organization':
        navigate(`/admin/organizations/${result.id}`);
        break;
      case 'concept':
        if (result.organization_id) {
          navigate(`/admin/organizations/${result.organization_id}/concepts/${result.id}`);
        }
        break;
      case 'store':
        if (result.concept_id) {
          // Get the organization_id for this concept to build the full route
          const { data: concept } = await supabase
            .from('concepts')
            .select('organization_id')
            .eq('id', result.concept_id)
            .single();
          
          if (concept) {
            navigate(`/admin/organizations/${concept.organization_id}/concepts/${result.concept_id}/stores/${result.id}`);
          }
        }
        break;
      case 'user':
        // Find the user's organization by looking at their access records
        const { data: userAccess } = await supabase
          .from('user_access')
          .select('organization_id')
          .eq('user_id', result.id)
          .limit(1);
        
        if (userAccess && userAccess.length > 0) {
          navigate(`/admin/organizations/${userAccess[0].organization_id}`);
        } else {
          // If no access records found, navigate to the organizations list
          navigate('/admin/organizations');
        }
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Search</h1>
      
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizations, concepts, stores, or users..."
            className="flex-1 rounded-lg bg-[#2A2A2A] border-[#333333] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white p-3"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showInactive"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded bg-[#2A2A2A] border-[#333333] text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="showInactive" className="text-sm text-[#999999]">
            Show inactive items
          </label>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className={`bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 ${
                result.is_active === false ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-[#2A2A2A] text-[#666666] rounded">
                      {result.type}
                    </span>
                    {result.is_active === false && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-white">{result.name}</h3>
                  {result.details && (
                    <p className="text-sm text-[#666666] mt-1">{result.details}</p>
                  )}
                </div>
                <button
                  onClick={() => handleViewDetails(result)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <div className="text-center text-[#666666] py-8">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}
