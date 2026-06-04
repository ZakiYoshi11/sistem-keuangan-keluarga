/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import RecoveryForm from './components/RecoveryForm';
import useAutoLogout from './hooks/useAutoLogout';
import { Toaster } from 'sonner';

function AppContent() {
  const { user, loading, isRecovery } = useAuth();
  useAutoLogout();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (isRecovery) {
    return <RecoveryForm />;
  }

  return user ? <Dashboard /> : <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <AppContent />
    </AuthProvider>
  );
}

