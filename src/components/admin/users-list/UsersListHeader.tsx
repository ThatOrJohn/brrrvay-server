
import React from 'react';
import { User } from 'lucide-react';

export default function UsersListHeader() {
  return (
    <div className="flex items-center mb-6">
      <User className="w-5 h-5 mr-2 text-indigo-400" />
      <h2 className="text-xl font-semibold">Store Users</h2>
    </div>
  );
}
