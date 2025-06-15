import React, { useState, useMemo } from 'react';
import { Edit2, Store, UserCheck, MoreHorizontal, Search, Filter, ArrowUpDown } from 'lucide-react';
import { UserRole } from '@/types/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import UserStoreBadges from './UserStoreBadges';
import { useUserStores } from '@/hooks/useUserStores';

type UserType = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password_hash: string | null;
  created_at: string;
  is_active: boolean;
  roles?: UserRole[];
};

interface UsersTableProps {
  users: UserType[];
  onEditUser: (user: UserType) => void;
  onManageStores: (user: UserType) => void;
  onImpersonateUser?: (user: UserType) => void;
}

type SortField = 'email' | 'name' | 'roles';
type SortDirection = 'asc' | 'desc';

export default function UsersTable({ 
  users, 
  onEditUser, 
  onManageStores, 
  onImpersonateUser 
}: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [sortField, setSortField] = useState<SortField>('email');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Fetch stores for all users
  const userIds = users.map(user => user.id);
  const { userStores, loading: storesLoading } = useUserStores(userIds);

  const formatRoles = (roles: UserRole[] | undefined) => {
    if (!roles || roles.length === 0) return 'No roles';
    return roles.map(role => 
      role === 'store_user' ? 'Store User' : 'Store Admin'
    ).join(', ');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Filter by active status
      if (!showInactive && !user.is_active) return false;
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.email.toLowerCase().includes(searchLower) ||
          (user.name && user.name.toLowerCase().includes(searchLower)) ||
          formatRoles(user.roles).toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortField) {
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'roles':
          aValue = formatRoles(a.roles);
          bValue = formatRoles(b.roles);
          break;
        default:
          aValue = a.email;
          bValue = b.email;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [users, searchTerm, showInactive, sortField, sortDirection]);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium text-[#999999] hover:text-white"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex gap-4 items-center px-6 pt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#999999] h-4 w-4" />
          <Input
            placeholder="Search users by email, name, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1A1A1A] border-[#333333] text-white placeholder:text-[#999999] focus:border-indigo-500"
          />
        </div>
        
        <Button
          variant={showInactive ? "default" : "outline"}
          size="sm"
          onClick={() => setShowInactive(!showInactive)}
          className={showInactive 
            ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
            : "border-[#333333] text-[#999999] hover:text-white hover:bg-[#333333]"
          }
        >
          <Filter className="w-4 h-4 mr-2" />
          {showInactive ? 'Hide Inactive' : 'Show Inactive'}
        </Button>
      </div>

      {/* Results Summary */}
      <div className="px-6 text-sm text-[#999999]">
        Showing {filteredAndSortedUsers.length} of {users.length} users
        {searchTerm && ` matching "${searchTerm}"`}
        {showInactive && ` (including inactive)`}
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <Table>
          <TableHeader>
            <TableRow className="border-[#333333] hover:bg-transparent">
              <TableHead className="text-[#999999]">
                <SortButton field="email">User Details</SortButton>
              </TableHead>
              <TableHead className="text-[#999999]">
                <SortButton field="roles">Roles</SortButton>
              </TableHead>
              <TableHead className="text-[#999999]">Store Access</TableHead>
              <TableHead className="text-[#999999] w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.map(user => (
              <TableRow 
                key={user.id} 
                className={`border-[#333333] hover:bg-[#2A2A2A] transition-colors ${
                  !user.is_active ? 'opacity-60 bg-red-900/10' : ''
                }`}
              >
                <TableCell className="py-4">
                  <div className="space-y-1">
                    <div className={`font-medium flex items-center gap-2 ${
                      user.is_active ? 'text-white' : 'text-red-400'
                    }`}>
                      {user.email}
                      {!user.is_active && (
                        <Badge variant="destructive" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {user.name && (
                      <div className="text-[#999999] text-sm">{user.name}</div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="py-4">
                  <Badge 
                    variant="secondary" 
                    className={`bg-[#2A2A2A] border-[#333333] ${
                      user.is_active ? 'text-[#999999]' : 'text-red-400'
                    }`}
                  >
                    {formatRoles(user.roles)}
                  </Badge>
                </TableCell>

                <TableCell className="py-4">
                  <UserStoreBadges 
                    stores={userStores[user.id] || []} 
                    maxVisible={2}
                  />
                </TableCell>
                
                <TableCell className="py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-[#999999] hover:text-white hover:bg-[#333333]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="bg-[#1A1A1A] border-[#333333] z-50"
                    >
                      <DropdownMenuItem 
                        onClick={() => onEditUser(user)}
                        className="text-indigo-400 focus:text-indigo-300 focus:bg-[#2A2A2A] cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => onManageStores(user)}
                        className="text-green-400 focus:text-green-300 focus:bg-[#2A2A2A] cursor-pointer"
                      >
                        <Store className="w-4 h-4 mr-2" />
                        Manage Stores
                      </DropdownMenuItem>
                      
                      {onImpersonateUser && user.is_active && (
                        <DropdownMenuItem 
                          onClick={() => onImpersonateUser(user)}
                          className="text-orange-400 focus:text-orange-300 focus:bg-[#2A2A2A] cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Impersonate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredAndSortedUsers.length === 0 && (
              <TableRow className="border-[#333333]">
                <TableCell colSpan={4} className="py-12 text-center text-[#999999]">
                  {searchTerm ? (
                    <div>
                      <p>No users found matching "{searchTerm}"</p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setSearchTerm('')}
                        className="text-indigo-400 hover:text-indigo-300 mt-2"
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p>No {showInactive ? '' : 'active '}users found</p>
                      {!showInactive && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setShowInactive(true)}
                          className="text-indigo-400 hover:text-indigo-300 mt-2"
                        >
                          Show inactive users
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
