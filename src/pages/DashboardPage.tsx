
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Key, LogOut, UserX } from 'lucide-react';
import StoreUserDashboard from '@/components/dashboard/StoreUserDashboard';
import StoreAdminDashboard from '@/components/dashboard/StoreAdminDashboard';
import PasswordChangeModal from '@/components/auth/PasswordChangeModal';
import { useImpersonation } from '@/hooks/useImpersonation';

type UserStore = {
  id: string;
  name: string;
  concept_id: string;
  organization_id: string;
};

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
};

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userStores, setUserStores] = useState<UserStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<UserStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();
  const { isImpersonating, stopImpersonation } = useImpersonation();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !isImpersonating) {
          navigate('/');
          return;
        }

        // Get current user from localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          navigate('/');
          return;
        }

        const user: CurrentUser = JSON.parse(storedUser);
        setCurrentUser(user);

        // Fetch user's stores
        const { data: userAccess, error: accessError } = await supabase
          .from('user_access')
          .select(`
            store_id,
            organization_id,
            concept_id,
            stores (
              id,
              name
            )
          `)
          .eq('user_id', user.id);

        if (accessError) throw accessError;

        const stores: UserStore[] = userAccess?.map(access => ({
          id: access.stores.id,
          name: access.stores.name,
          concept_id: access.concept_id,
          organization_id: access.organization_id
        })) || [];

        setUserStores(stores);
        
        // Set default store (first one for now - we can add primary store logic later)
        if (stores.length > 0) {
          setSelectedStore(stores[0]);
        }

      } catch (error) {
        console.error('Error initializing dashboard:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate, isImpersonating]);

  const handleLogout = async () => {
    if (isImpersonating) {
      await stopImpersonation();
    } else {
      await supabase.auth.signOut();
      localStorage.removeItem('currentUser');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser || !selectedStore) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No stores assigned</h1>
          <p className="text-gray-400 mb-6">You don't have access to any stores yet.</p>
          <button
            onClick={handleLogout}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const isStoreAdmin = currentUser.roles.includes('store_admin');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">Brrrvay Dashboard</h1>
            
            {/* Impersonation Banner */}
            {isImpersonating && (
              <div className="bg-yellow-600 text-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
                Impersonating User
              </div>
            )}
            
            {/* Store Selector */}
            {userStores.length > 1 && (
              <select
                value={selectedStore.id}
                onChange={(e) => {
                  const store = userStores.find(s => s.id === e.target.value);
                  if (store) setSelectedStore(store);
                }}
                className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
              >
                {userStores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              Welcome, {currentUser.name || currentUser.email}
            </span>
            <div className="flex space-x-2">
              {currentUser.roles.map(role => (
                <span
                  key={role}
                  className="px-2 py-1 bg-indigo-600 text-white text-xs rounded"
                >
                  {role}
                </span>
              ))}
            </div>
            
            {!isImpersonating && (
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            )}
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              {isImpersonating ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Stop Impersonation
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {isStoreAdmin ? (
          <StoreAdminDashboard
            store={selectedStore}
            user={currentUser}
          />
        ) : (
          <StoreUserDashboard
            store={selectedStore}
            user={currentUser}
          />
        )}
      </main>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userId={currentUser.id}
        isExternalUser={true}
      />
    </div>
  );
}
