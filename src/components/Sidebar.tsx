import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClass = (path: string) => `
    block px-4 py-2 text-sm rounded-lg transition-colors
    ${isActive(path)
      ? 'bg-indigo-600 text-white'
      : 'text-[#666666] hover:bg-[#1A1A1A] hover:text-white'
    }
  `;

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-[#333333] min-h-screen p-4">
      <nav className="space-y-2">
        <Link
          to="/admin/search"
          className={linkClass('/admin/search')}
        >
          Search
        </Link>
        <Link
          to="/admin/dashboard"
          className={linkClass('/admin/dashboard')}
        >
          Dashboard
        </Link>
      </nav>
    </aside>
  );
}