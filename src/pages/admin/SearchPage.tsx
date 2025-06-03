import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type SearchResult = {
  type: 'organization' | 'concept' | 'store' | 'user';
  id: string;
  name: string;
  details?: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
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
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Search organizations
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5);

      // Search concepts
      const { data: concepts } = await supabase
        .from('concepts')
        .select('id, name, organization_id')
        .ilike('name', `%${query}%`)
        .limit(5);

      // Search stores
      const { data: stores } = await supabase
        .from('stores')
        .select('id, name, concept_id')
        .ilike('name', `%${query}%`)
        .limit(5);

      // Search users
      const { data: users } = await supabase
        .from('users')
        .select('id, email, name, role')
        .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(5);

      const searchResults: SearchResult[] = [
        ...(orgs?.map(org => ({
          type: 'organization' as const,
          id: org.id,
          name: org.name,
        })) || []),
        ...(concepts?.map(concept => ({
          type: 'concept' as const,
          id: concept.id,
          name: concept.name,
          details: `Organization: ${concept.organization_id}`,
        })) || []),
        ...(stores?.map(store => ({
          type: 'store' as const,
          id: store.id,
          name: store.name,
          details: `Concept: ${store.concept_id}`,
        })) || []),
        ...(users?.map(user => ({
          type: 'user' as const,
          id: user.id,
          name: user.name || user.email,
          details: `Role: ${user.role}`,
        })) || []),
      ];

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (result: SearchResult) => {
    switch (result.type) {
      case 'organization':
        navigate('/admin/organizations', { state: { selectedOrgId: result.id } });
        break;
      case 'concept':
        navigate('/admin/organizations', { state: { selectedConceptId: result.id } });
        break;
      case 'store':
        navigate('/admin/organizations', { state: { selectedStoreId: result.id } });
        break;
      case 'user':
        // TODO: Implement user details view
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Search</h1>
      
      <div className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizations, concepts, stores, or users..."
            className="flex-1 rounded-lg bg-[#2A2A2A] border-[#333333] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white p-3"
          />
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-[#2A2A2A] text-[#666666] rounded mb-2">
                    {result.type}
                  </span>
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