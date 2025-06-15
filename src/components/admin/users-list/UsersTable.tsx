
import React from 'react';
import { Edit2, Eye, EyeOff, Store, UserCheck, MoreHorizontal } from 'lucide-react';
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

export default function UsersTable({ 
  users, 
  onEditUser, 
  onManageStores, 
  onImpersonateUser 
}: UsersTableProps) {
  const formatRoles = (roles: UserRole[] | undefined) => {
    if (!roles || roles.length === 0) return 'No roles';
    return roles.map(role => 
      role === 'store_user' ? 'Store User' : 'Store Admin'
    ).join(', ');
  };

  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow className="border-[#333333] hover:bg-transparent">
            <TableHead className="text-[#999999] font-medium">User Details</TableHead>
            <TableHead className="text-[#999999] font-medium">Roles</TableHead>
            <TableHead className="text-[#999999] font-medium">Status</TableHead>
            <TableHead className="text-[#999999] font-medium w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow 
              key={user.id} 
              className={`border-[#333333] hover:bg-[#2A2A2A] transition-colors ${
                !user.is_active ? 'opacity-60' : ''
              }`}
            >
              <TableCell className="py-4">
                <div className="space-y-1">
                  <div className="text-white font-medium">{user.email}</div>
                  {user.name && (
                    <div className="text-[#999999] text-sm">{user.name}</div>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="py-4">
                <Badge 
                  variant="secondary" 
                  className="bg-[#2A2A2A] text-[#999999] border-[#333333]"
                >
                  {formatRoles(user.roles)}
                </Badge>
              </TableCell>
              
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                  {user.is_active ? (
                    <Eye className="w-4 h-4 text-green-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    user.is_active ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
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
        </TableBody>
      </Table>
    </div>
  );
}
