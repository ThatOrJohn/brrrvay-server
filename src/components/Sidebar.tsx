import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md min-h-screen p-4">
      <nav className="space-y-2">
        <Link
          to="/admin"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Dashboard
        </Link>
        <Link
          to="/admin/organizations"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Organizations
        </Link>
        <Link
          to="/admin/users"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Users
        </Link>
        <Link
          to="/admin/trials"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Trials
        </Link>
      </nav>
    </aside>
  );
}