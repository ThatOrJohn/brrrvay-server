import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  return (
    <nav className="bg-[#1A1A1A] border-b border-[#333333]">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/admin/search" className="text-xl font-bold text-white">
            Brrrvay Admin
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="text-[#666666] hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
