import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function TransactionForm({ onRefresh }: { onRefresh: () => void }) {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'pemasukan' | 'pengeluaran'>('pengeluaran');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user) return;
      const { error } = await supabase.from('transactions').insert([
        {
          user_id: user.id,
          transaction_date: date,
          type,
          category,
          amount: Number(amount),
          notes,
        }
      ]);

      if (error) throw error;
      
      toast.success('Transaksi berhasil ditambahkan');
      setCategory('');
      setAmount('');
      setNotes('');
      onRefresh();
    } catch (error: any) {
      toast.error('Gagal menambah transaksi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
        <PlusCircle className="mr-2 h-5 w-5 text-blue-600" />
        Tambah Transaksi Baru
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'pemasukan' | 'pengeluaran')}
            className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-shadow"
          >
            <option value="pengeluaran">Pengeluaran</option>
            <option value="pemasukan">Pemasukan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
          <input
            type="text"
            required
            placeholder="Iuran, Listrik, dll"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nominal (Rp)</label>
          <input
            type="number"
            required
            min="0"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan</label>
          <input
            type="text"
            placeholder="Opsional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-5 flex justify-end mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center active:scale-[0.98]"
          >
             {loading && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />}
            Simpan Transaksi
          </button>
        </div>
      </form>
    </div>
  );
}
