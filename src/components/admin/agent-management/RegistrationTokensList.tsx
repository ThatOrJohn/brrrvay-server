
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Copy } from 'lucide-react';
import { AgentRegistrationToken } from '@/types/agent';

interface RegistrationTokensListProps {
  tokens: AgentRegistrationToken[];
  onCopyToken: (token: string) => void;
}

export default function RegistrationTokensList({ 
  tokens, 
  onCopyToken 
}: RegistrationTokensListProps) {
  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const isTokenUsed = (token: AgentRegistrationToken) => {
    return !!token.used_at;
  };

  return (
    <Card className="bg-[#1A1A1A] border-[#333333]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Registration Tokens
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tokens.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No registration tokens found</p>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`p-4 rounded-lg border ${
                  isTokenUsed(token) || isTokenExpired(token.expires_at)
                    ? 'bg-gray-500/10 border-gray-500/30'
                    : 'bg-indigo-500/10 border-indigo-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <code className="text-lg font-mono text-white bg-[#2A2A2A] px-3 py-1 rounded">
                      {token.token}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCopyToken(token.token)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTokenUsed(token) ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Used
                      </Badge>
                    ) : isTokenExpired(token.expires_at) ? (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        Expired
                      </Badge>
                    ) : (
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  <p>Created: {new Date(token.created_at).toLocaleString()}</p>
                  <p>Expires: {new Date(token.expires_at).toLocaleString()}</p>
                  {token.used_at && (
                    <p>Used: {new Date(token.used_at).toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
