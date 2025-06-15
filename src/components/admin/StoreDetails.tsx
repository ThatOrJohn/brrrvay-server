
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentManagement from './AgentManagement';
import { Settings, Monitor } from 'lucide-react';

interface StoreDetailsProps {
  store: {
    id: string;
    name: string;
    external_id?: string;
    concept_id: string;
    is_active: boolean;
  };
  storeName: string;
}

export default function StoreDetails({ store, storeName }: StoreDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{store.name}</h1>
          <p className="text-gray-400">Store Management</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            store.is_active 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {store.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#1A1A1A] border border-[#333333]">
          <TabsTrigger 
            value="agents" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400"
          >
            <Monitor className="w-4 h-4 mr-2" />
            Agent Management
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400"
          >
            <Settings className="w-4 h-4 mr-2" />
            Store Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-6">
          <AgentManagement storeId={store.id} storeName={store.name} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="bg-[#1A1A1A] border-[#333333]">
            <CardHeader>
              <CardTitle className="text-white">Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Store Name
                </label>
                <div className="text-white bg-[#2A2A2A] px-3 py-2 rounded border border-[#333333]">
                  {store.name}
                </div>
              </div>
              
              {store.external_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    External ID
                  </label>
                  <div className="text-white bg-[#2A2A2A] px-3 py-2 rounded border border-[#333333]">
                    {store.external_id}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Store ID
                </label>
                <div className="text-gray-400 bg-[#2A2A2A] px-3 py-2 rounded border border-[#333333] font-mono text-sm">
                  {store.id}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <div className={`inline-flex px-3 py-2 rounded border ${
                  store.is_active 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {store.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
