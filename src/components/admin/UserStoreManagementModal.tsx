
import React, { useState, useEffect } from 'react';
import { Store, User, Save, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type StoreType = {
  id: string;
  name: string;
  concept_id: string;
  concept_name: string;
  external_id: string | null;
  is_active: boolean;
};

type UserType = {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
};

interface UserStoreManagementModalProps {
  user: UserType;
  organizationId: string;
  organizationName: string;
  onClose: () => void;
  onSave: () => void;
}

export default function UserStoreManagementModal({ 
  user, 
  organizationId, 
  organizationName,
  onClose, 
  onSave 
}: UserStoreManagementModalProps) {
  const [allStores, setAllStores] = useState<StoreType[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchOrganizationStores = async () => {
    try {
      setLoading(true);
      
      // Get all concepts for this organization
      const { data: concepts, error: conceptsError } = await supabase
        .from('concepts')
        .select('id, name')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (conceptsError) throw conceptsError;

      if (!concepts?.length) {
        setAllStores([]);
        return;
      }

      // Get all stores for these concepts
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id, name, concept_id, external_id, is_active')
        .in('concept_id', concepts.map(c => c.id))
        .eq('is_active', true)
        .order('name');

      if (storesError) throw storesError;

      // Combine store data with concept names
      const storesWithConcepts = (stores || []).map(store => ({
        ...store,
        concept_name: concepts.find(c => c.id === store.concept_id)?.name || 'Unknown'
      }));

      setAllStores(storesWithConcepts);

      // Get user's current store access
      const { data: userAccess, error: accessError } = await supabase
        .from('user_access')
        .select('store_id')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId);

      if (accessError) throw accessError;

      const currentStoreIds = userAccess?.map(ua => ua.store_id) || [];
      setSelectedStores(currentStoreIds);

    } catch (error) {
      console.error('Error fetching organization stores:', error);
      toast({
        title: "Error",
        description: "Failed to fetch organization stores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Remove all existing mappings for this user in this organization
      await supabase
        .from('user_access')
        .delete()
        .eq('user_id', user.id)
        .eq('organization_id', organizationId);

      // Add new mappings
      if (selectedStores.length > 0) {
        const newMappings = selectedStores.map(storeId => {
          const store = allStores.find(s => s.id === storeId);
          return {
            user_id: user.id,
            store_id: storeId,
            concept_id: store?.concept_id,
            organization_id: organizationId
          };
        });

        const { error } = await supabase
          .from('user_access')
          .insert(newMappings);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "User store access updated successfully",
      });

      onSave();
    } catch (error) {
      console.error('Error updating user store access:', error);
      toast({
        title: "Error",
        description: "Failed to update user store access",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStoreToggle = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  const groupedStores = allStores.reduce((acc, store) => {
    if (!acc[store.concept_name]) {
      acc[store.concept_name] = [];
    }
    acc[store.concept_name].push(store);
    return acc;
  }, {} as Record<string, StoreType[]>);

  useEffect(() => {
    fetchOrganizationStores();
  }, [user.id, organizationId]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-4xl border border-[#333333] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">
              Manage Store Access: {user.email}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-gray-400">
              <Building2 className="w-4 h-4" />
              <span>{organizationName}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading stores...</div>
        ) : Object.keys(groupedStores).length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No active stores found in this organization
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedStores).map(([conceptName, stores]) => (
              <Card key={conceptName} className="bg-[#2A2A2A] border-[#333333]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    {conceptName} ({stores.length} stores)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stores.map(store => (
                      <label 
                        key={store.id} 
                        className="flex items-center space-x-3 cursor-pointer hover:bg-[#333333] p-3 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStores.includes(store.id)}
                          onChange={() => handleStoreToggle(store.id)}
                          className="rounded bg-[#1A1A1A] border-[#333333] text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium">{store.name}</div>
                          {store.external_id && (
                            <div className="text-gray-400 text-sm">ID: {store.external_id}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="bg-[#2A2A2A] border border-[#333333] rounded-lg p-4">
              <div className="text-white font-medium mb-2">
                Summary: {selectedStores.length} stores selected
              </div>
              <div className="text-gray-400 text-sm">
                This user will have access to the selected stores across all concepts in {organizationName}.
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-gray-400 border-gray-600 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
