
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface RegistrationTokenGeneratorProps {
  onGenerateToken: (expirationMinutes: number) => Promise<void>;
  loading: boolean;
}

export default function RegistrationTokenGenerator({ 
  onGenerateToken, 
  loading 
}: RegistrationTokenGeneratorProps) {
  const [expirationMinutes, setExpirationMinutes] = useState(15);

  const handleGenerateToken = async () => {
    await onGenerateToken(expirationMinutes);
  };

  return (
    <Card className="bg-[#1A1A1A] border-[#333333]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Generate Registration Token
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiration (minutes)
            </label>
            <Input
              type="number"
              value={expirationMinutes}
              onChange={(e) => setExpirationMinutes(parseInt(e.target.value) || 15)}
              min={1}
              max={1440}
              className="bg-[#2A2A2A] border-[#333333] text-white"
            />
          </div>
          <Button
            onClick={handleGenerateToken}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Generate Token
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
