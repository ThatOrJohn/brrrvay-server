import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminNavbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/admin" className="text-xl font-bold text-gray-900">
            Brrrvay Admin
          </Link>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              Profile
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}