import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { PlusCircle, Split, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Pocket } from '../types';

export default function TransactionForm({ onRefresh, pockets }: { onRefresh: () => void, pockets: Pocket[] }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pengeluaran' | 'split'>('pengeluaran');
  
  // Single tx state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [pocketId, setPocketId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  // Split tx state
  const [splitAmount, setSplitAmount] = useState('');
  const [allocations, setAllocations] = useState<{pocketId: string, amount: string}[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Initialize allocations when pockets change
  React.useEffect(() => {
    if (allocations.length === 0 && pockets.length > 0) {
      setAllocations(pockets.map(p => ({ pocketId: p.id, amount: '' })));
    } else if (pockets.length > 0) {
      // Sync added/removed pockets
      const currentIds = allocations.map(a => a.pocketId);
      const newPockets = pockets.filter(p => !currentIds.includes(p.id));
      const validPockets = allocations.filter(a => pockets.some(p => p.id === a.pocketId));
      setAllocations([...validPockets, ...newPockets.map(p => ({ pocketId: p.id, amount: '' }))]);
    }
  }, [pockets]);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!pocketId) return toast.error('Pilih kantong terlebih dahulu');
    setLoading(true);
    
    try {
      const pocketInfo = pockets.find(p => p.id === pocketId);
      const { error } = await supabase.from('transactions').insert([
        {
          user_id: user.id,
          transaction_date: date,
          type: 'pengeluaran',
          pocket_id: pocketId,
          category: pocketInfo?.name || 'Lainnya',
          amount: Number(amount),
          notes,
        }
      ]);

      if (error) throw error;
      
      toast.success('Pengeluaran berhasil dicatat');
      setAmount('');
      setNotes('');
      onRefresh();
    } catch (error: any) {
      toast.error('Gagal menambah transaksi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSplitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const totalInput = Number(splitAmount);
    if (!totalInput || totalInput <= 0) return toast.error('Masukkan total pemasukan yang valid');

    const totalAllocated = allocations.reduce((sum, alloc) => sum + (Number(alloc.amount) || 0), 0);
    
    if (totalAllocated !== totalInput) {
      return toast.error(`Total alokasi (${totalAllocated}) harus sama dengan Total Pemasukan (${totalInput}). Selisih: ${totalInput - totalAllocated}`);
    }

    setLoading(true);
    try {
      const payloads = allocations
        .filter(a => Number(a.amount) > 0)
        .map(a => ({
          user_id: user.id,
          transaction_date: date,
          type: 'pemasukan',
          pocket_id: a.pocketId,
          category: 'Bagi Pemasukan', // fallback for old UI
          amount: Number(a.amount),
          notes: notes || 'Pemasukan dipecah ke kantong',
        }));

      if (payloads.length === 0) throw new Error('Tidak ada alokasi valid');

      const { error } = await supabase.from('transactions').insert(payloads);
      
      if (error) throw error;
      
      toast.success('Pemasukan berhasil dibagi dan disimpan');
      setSplitAmount('');
      setNotes('');
      setAllocations(allocations.map(a => ({...a, amount: ''})));
      onRefresh();
    } catch (error: any) {
      toast.error('Gagal menyimpan pemasukan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocationChange = (index: number, val: string) => {
    const newAlloc = [...allocations];
    newAlloc[index].amount = val;
    setAllocations(newAlloc);
  };

  if (pockets.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 text-center">
        <p className="text-gray-500 mb-2">Buat kantong keuangan terlebih dahulu untuk mencatat transaksi.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <button 
          onClick={() => setActiveTab('pengeluaran')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center transition-colors ${activeTab === 'pengeluaran' ? 'text-red-600 bg-white border-t-2 border-t-red-600 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <ArrowUpCircle className="w-4 h-4 mr-2" /> Pengeluaran
        </button>
        <button 
          onClick={() => setActiveTab('split')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center transition-colors ${activeTab === 'split' ? 'text-blue-600 bg-white border-t-2 border-t-blue-600 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Split className="w-4 h-4 mr-2" /> Bagi Pemasukan
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'pengeluaran' ? (
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Kantong</label>
              <select
                required
                value={pocketId}
                onChange={(e) => setPocketId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white transition-shadow"
              >
                <option value="" disabled>Pilih Kantong...</option>
                {pockets.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nominal (Rp)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-shadow"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan</label>
              <input
                type="text"
                placeholder="Opsional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-shadow"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-5 flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading || !pocketId}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center active:scale-[0.98]"
              >
                 {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Simpan Pengeluaran
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSplitSubmit} className="space-y-6 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1.5">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-blue-200 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1.5">Total Pemasukan (Rp)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Contoh: 1000000"
                    value={splitAmount}
                    onChange={(e) => setSplitAmount(e.target.value)}
                    className="w-full rounded-xl border border-blue-200 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-white font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1.5">Sumber / Catatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Gaji Bulanan"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-blue-200 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-white"
                  />
                </div>
             </div>

             <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Alokasi ke Kantong</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allocations.map((alloc, idx) => {
                    const pocketInfo = pockets.find(p => p.id === alloc.pocketId);
                    return (
                      <div key={alloc.pocketId} className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 truncate">{pocketInfo?.name}</label>
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          value={alloc.amount}
                          onChange={(e) => handleAllocationChange(idx, e.target.value)}
                          className="w-full rounded-lg border border-gray-200 py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-white"
                        />
                      </div>
                    );
                  })}
                </div>
             </div>

             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
               <div className="text-sm">
                 <span className="text-gray-500">Teralokasi: </span>
                 <span className={`font-bold ${
                   splitAmount && allocations.reduce((sum, a) => sum + Number(a.amount || 0), 0) === Number(splitAmount)
                   ? 'text-green-600' : 'text-red-500'
                 }`}>
                   {allocations.reduce((sum, a) => sum + Number(a.amount || 0), 0)}
                 </span>
                 <span className="text-gray-400"> / {splitAmount || 0}</span>
               </div>
               <button
                  type="submit"
                  disabled={loading || !splitAmount}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center active:scale-[0.98]"
                >
                  {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Split className="mr-2 h-4 w-4" />}
                  Bagi & Simpan Pemasukan
                </button>
             </div>
          </form>
        )}
      </div>
    </div>
  );
}
