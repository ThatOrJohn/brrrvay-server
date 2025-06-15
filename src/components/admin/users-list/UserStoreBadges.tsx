
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Store } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Store {
  id: string;
  name: string;
}

interface UserStoreBadgesProps {
  stores: Store[];
  maxVisible?: number;
}

export default function UserStoreBadges({ stores, maxVisible = 2 }: UserStoreBadgesProps) {
  if (!stores || stores.length === 0) {
    return (
      <Badge variant="outline" className="bg-[#2A2A2A] border-[#333333] text-[#666666]">
        <Store className="w-3 h-3 mr-1" />
        No stores
      </Badge>
    );
  }

  const visibleStores = stores.slice(0, maxVisible);
  const remainingCount = stores.length - maxVisible;
  const hasMore = remainingCount > 0;

  return (
    <div className="flex items-center gap-1">
      {/* Primary store (first one) */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className="bg-indigo-600/20 border-indigo-500/30 text-indigo-300 max-w-[120px] truncate"
            >
              <Store className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{visibleStores[0].name}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-[#1A1A1A] border-[#333333] text-white max-w-[200px]"
          >
            <p className="font-medium">Primary Store</p>
            <p className="text-sm text-[#999999]">{visibleStores[0].name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Secondary stores */}
      {visibleStores.slice(1).map((store) => (
        <TooltipProvider key={store.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="bg-[#2A2A2A] border-[#333333] text-[#999999] max-w-[100px] truncate text-xs"
              >
                <span className="truncate">{store.name}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="bg-[#1A1A1A] border-[#333333] text-white max-w-[200px]"
            >
              <p className="text-sm">{store.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {/* More indicator */}
      {hasMore && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="bg-[#333333] border-[#555555] text-[#999999] text-xs px-2"
              >
                +{remainingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="bg-[#1A1A1A] border-[#333333] text-white max-w-[250px]"
            >
              <p className="font-medium mb-1">Additional Stores ({remainingCount})</p>
              <div className="space-y-1">
                {stores.slice(maxVisible).map((store) => (
                  <p key={store.id} className="text-sm text-[#999999]">
                    {store.name}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
