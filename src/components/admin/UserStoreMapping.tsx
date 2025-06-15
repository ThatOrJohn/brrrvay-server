
import React, { useState, useEffect } from 'react';
import { Store, User, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type StoreType = {
  id: string;
  name: string;
  concept_id: string;
  external_id: string | null;
  is_active: boolean;
};

type UserType = {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
};

interface UserStoreMappingProps {
  user: UserType;
  stores: StoreType[];
  onClose: () => void;
  onSave: () => void;
}

export default function UserStoreMapping({ user, stores, onClose, onSave }: UserStoreMappingProps) {
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchUserStores = async () => {
    try {
      setLoading(true);
      const { data: userAccess, error } = await supabase
        .from('user_access')
        .select('store_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const storeIds = userAccess?.map(ua => ua.store_id) || [];
      setSelectedStores(storeIds);
    } catch (error) {
      console.error('Error fetching user stores:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user store mappings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Remove all existing mappings for this user in these stores
      const storeIds = stores.map(s => s.id);
      await supabase
        .from('user_access')
        .delete()
        .eq('user_id', user.id)
        .in('store_id', storeIds);

      // Add new mappings
      if (selectedStores.length > 0) {
        const newMappings = selectedStores.map(storeId => {
          const store = stores.find(s => s.id === storeId);
          return {
            user_id: user.id,
            store_id: storeId,
            concept_id: store?.concept_id,
            organization_id: null // This might need to be set based on your data structure
          };
        });

        const { error } = await supabase
          .from('user_access')
          .insert(newMappings);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "User store mappings updated successfully",
      });

      onSave();
    } catch (error) {
      console.error('Error updating user store mappings:', error);
      toast({
        title: "Error",
        description: "Failed to update user store mappings",
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

  useEffect(() => {
    fetchUserStores();
  }, [user.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-2xl border border-[#333333] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Edit Store Access: {user.email}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Card className="bg-[#2A2A2A] border-[#333333]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Store className="w-5 h-5" />
              Available Stores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-gray-400">Loading stores...</div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {stores.map(store => (
                  <label key={store.id} className="flex items-center space-x-3 cursor-pointer hover:bg-[#333333] p-3 rounded">
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
                    <div className={`px-2 py-1 rounded text-xs ${
                      store.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {store.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
            disabled={saving}
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
