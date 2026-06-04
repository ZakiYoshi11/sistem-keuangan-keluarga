import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, UserCircle } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import ParentDashboard from './ParentDashboard';

export default function Dashboard() {
  const { user, role, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans animate-in fade-in duration-500">
      <nav className="bg-white px-4 py-3 sm:px-6 shadow-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-inner shadow-blue-700/50">
            <Home className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Sistem Keuangan Keluarga</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-900">{user?.email}</span>
              <div className="flex justify-end mt-0.5">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  role === 'admin' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-green-50 text-green-700 border border-green-100'
                }`}>
                  {role === 'admin' ? '• Admin' : '• Pantauan'}
                </span>
              </div>
            </div>
            <UserCircle className="h-9 w-9 text-gray-300" />
          </div>
          
          <div className="h-8 w-[1px] bg-gray-200"></div>

          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all flex items-center group"
            title="Keluar"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Mobile only Role Badge */}
        <div className="md:hidden flex flex-col items-start mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-sm font-semibold text-gray-900 mb-1.5">{user?.email}</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'
          }`}>
            {role === 'admin' ? 'Admin (Penginput)' : 'Pantauan (Orang Tua)'}
          </span>
        </div>

        {role === 'admin' ? <AdminDashboard /> : <ParentDashboard />}

      </main>
    </div>
  );
}
