import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [internalUsers, setInternalUsers] = useState<{ email: string }[]>([]);
  const [debugError, setDebugError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInternalUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('internal_users')
          .select('email');

        if (error) {
          console.error('Error fetching internal users:', error);
          setDebugError(`Error fetching users: ${error.message}`);
          return;
        }

        setInternalUsers(data || []);
      } catch (err) {
        console.error('Error in fetchInternalUsers:', err);
        setDebugError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    fetchInternalUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        const { data: internalUser, error: internalError } = await supabase
          .from('internal_users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (internalUser) {
          navigate('/admin/dashboard');
        } else {
          setError('Access denied. Internal users only.');
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-[#333333]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Brrrvay Admin</h1>
          <p className="text-[#666666]">Internal access only</p>
        </div>
        
        {/* Temporary Debug Section */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-white text-sm font-semibold mb-2">Debug Information</h2>
          <div className="text-xs text-gray-400">
            <p className="mb-1">Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</p>
            <p className="mb-2">Internal Users:</p>
            {debugError ? (
              <p className="text-red-400">{debugError}</p>
            ) : internalUsers.length > 0 ? (
              <ul className="list-disc pl-4">
                {internalUsers.map((user, index) => (
                  <li key={index}>{user.email}</li>
                ))}
              </ul>
            ) : (
              <p className="italic">No internal users found</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#666666]">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-[#2A2A2A] border-[#333333] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#666666]">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-[#2A2A2A] border-[#333333] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}