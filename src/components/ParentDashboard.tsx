import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import SummaryCards from './SummaryCards';
import DashboardCharts from './DashboardCharts';
import TransactionList from './TransactionList';
import { Link2, Users } from 'lucide-react';

import PocketBalances from './PocketBalances';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [linkedAdmins, setLinkedAdmins] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pockets, setPockets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: links, error: linkError } = await supabase
        .from('parent_admin_links')
        .select('admin_id')
        .eq('parent_id', user.id);

      if (linkError) throw linkError;

      if (links && links.length > 0) {
        const adminIds = links.map(l => l.admin_id);
        setLinkedAdmins(adminIds);

        const [txRes, pocketRes] = await Promise.all([
          supabase
            .from('transactions')
            .select('*, pockets(name)')
            .in('user_id', adminIds)
            .order('transaction_date', { ascending: false })
            .order('created_at', { ascending: false }),
          supabase
            .from('pockets')
            .select('*')
            .in('user_id', adminIds)
            .order('created_at', { ascending: false })
        ]);

        if (txRes.error) throw txRes.error;
        if (pocketRes.error) throw pocketRes.error;

        setTransactions(txRes.data || []);
        setPockets(pocketRes.data || []);
      } else {
        setLinkedAdmins([]);
        setTransactions([]);
        setPockets([]);
      }
    } catch (error: any) {
      toast.error('Gagal mengambil data pantauan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim() || !user) return;

    try {
      // Find admin by connection token
      const { data: adminRole, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('connection_token', tokenInput.trim())
        .maybeSingle();

      if (roleError) throw roleError;
      if (!adminRole) {
        toast.error('Token tidak ditemukan atau tidak valid');
        return;
      }

      // Check if already connected
      if (linkedAdmins.includes(adminRole.user_id)) {
        toast.error('Akun tersebut sudah terhubung');
        return;
      }

      const { error: insertError } = await supabase
        .from('parent_admin_links')
        .insert({
          parent_id: user.id,
          admin_id: adminRole.user_id,
        });

      if (insertError) throw insertError;

      toast.success('Berhasil menghubungkan akun!');
      setTokenInput('');
      fetchData();
    } catch (e: any) {
      toast.error('Gagal menghubungkan: ' + e.message);
    }
  };

  if (loading) {
     return <div className="flex justify-center items-center h-64">
       <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-green-600"></div>
     </div>
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
          <Link2 className="mr-2 h-5 w-5 text-green-600" />
          Hubungkan Akun Penginput
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Masukkan 6 digit Token Koneksi yang dimiliki oleh anak Anda untuk memantau keuangan mereka.
        </p>
        <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            required
            placeholder="Contoh: AB12CD"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
            maxLength={6}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all uppercase"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors active:scale-[0.98] whitespace-nowrap"
          >
            Hubungkan Akun
          </button>
        </form>
      </div>

      {linkedAdmins.length > 0 ? (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
             <div className="flex items-center space-x-3 text-gray-700">
               <Users className="h-5 w-5 text-blue-500" />
               <span className="font-medium text-sm">Sedang memantau <span className="font-bold text-gray-900">{linkedAdmins.length}</span> akun anak.</span>
             </div>
          </div>
          <SummaryCards transactions={transactions} />
          
          <PocketBalances pockets={pockets} transactions={transactions} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <DashboardCharts transactions={transactions} />
            </div>
            <div className="lg:col-span-2">
              <TransactionList transactions={transactions} onRefresh={fetchData} />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-gray-900 font-bold mb-2">Belum Ada Akun Terhubung</h4>
          <p className="text-sm text-gray-500 max-w-sm">Minta Token Koneksi dari akun Penginput (admin) dan masukkan di atas untuk mulai memantau pengeluaran.</p>
        </div>
      )}
    </div>
  )
}
