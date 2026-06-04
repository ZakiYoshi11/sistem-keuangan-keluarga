import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import SummaryCards from './SummaryCards';
import DashboardCharts from './DashboardCharts';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import { KeyRound, Copy, Pencil, X, Check } from 'lucide-react';

export default function AdminDashboard() {
  const { user, connectionToken, refreshRole } = useAuth();
  const [currentToken, setCurrentToken] = useState<string | null>(connectionToken);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentToken(connectionToken);
  }, [connectionToken]);

  const [isEditingToken, setIsEditingToken] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [updatingToken, setUpdatingToken] = useState(false);

  const handleUpdateToken = async () => {
    if (!user || !newToken.trim()) return;
    
    const formattedToken = newToken.trim().toUpperCase();
    setUpdatingToken(true);

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .update({ connection_token: formattedToken })
        .eq('user_id', user.id)
        .select();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Gagal: Token tersebut sudah digunakan oleh akun lain. Silakan cari kombinasi lain.');
        }
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Gagal: Data tidak ditemukan atau tidak diperbarui.');
      }

      setCurrentToken(formattedToken);
      // Still refresh context in background but don't strictly await it if it unmounts component
      refreshRole().catch(console.error); 
      
      toast.success('Token berhasil diperbarui!');
      setIsEditingToken(false);
    } catch (e: any) {
      toast.error(e.message || 'Gagal memperbarui token');
    } finally {
      setUpdatingToken(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (e: any) {
      toast.error('Gagal mengambil data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const copyToken = () => {
    if (currentToken) {
      navigator.clipboard.writeText(currentToken);
      toast.success('Token disalin!');
    }
  }

  if (loading) {
     return <div className="flex justify-center items-center h-64">
       <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600"></div>
     </div>
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      
      {/* Token Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-md p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -tr-translate-y-1/2 translate-x-1/3 opacity-10 pointer-events-none">
          <KeyRound className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex-1">
          <h3 className="text-xl font-bold mb-2 flex items-center">
            <KeyRound className="mr-2 h-5 w-5" />
            Token Relasi Anda
          </h3>
          <p className="text-blue-100 text-sm">
            Berikan token ini kepada Orang Tua agar mereka dapat memantau keuangan Anda.
          </p>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 border border-white/20">
          {isEditingToken ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                autoFocus
                maxLength={6}
                value={newToken}
                onChange={(e) => setNewToken(e.target.value.toUpperCase())}
                placeholder="Ex: ZAKI99"
                className="w-28 text-center text-xl font-mono font-bold tracking-widest bg-white/20 text-white placeholder-blue-200 border border-white/30 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-white/50 uppercase"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleUpdateToken}
                  disabled={updatingToken || !newToken.trim()}
                  className="p-1.5 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                  title="Simpan"
                >
                  {updatingToken ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check className="h-5 w-5 text-white" />}
                </button>
                <button 
                  onClick={() => setIsEditingToken(false)}
                  disabled={updatingToken}
                  className="p-1.5 bg-red-400 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
                  title="Batal"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs text-blue-200 font-medium mb-1 uppercase tracking-wider text-center">Kode Akses</p>
                <p className="text-2xl font-mono font-bold tracking-widest min-w-[5rem] text-center">{currentToken || '------'}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={copyToken} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors active:scale-95" title="Salin Token">
                  <Copy className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => {
                     setNewToken(currentToken || '');
                    setIsEditingToken(true);
                  }} 
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors active:scale-95" 
                  title="Ubah Token"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <SummaryCards transactions={transactions} />
      
      <TransactionForm onRefresh={fetchTransactions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <DashboardCharts transactions={transactions} />
        </div>
        <div className="lg:col-span-2">
          <TransactionList transactions={transactions} onRefresh={fetchTransactions} />
        </div>
      </div>
    </div>
  )
}
