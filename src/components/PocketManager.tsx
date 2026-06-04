import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Pocket } from '../types';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Check, X, WalletCards } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PocketManager({ pockets, onRefresh }: { pockets: Pocket[], onRefresh: () => void }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newPocketName, setNewPocketName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddPocket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPocketName.trim() || !user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('pockets').insert([{ name: newPocketName.trim(), user_id: user.id }]);
      if (error) throw error;
      toast.success('Kantong berhasil dibuat');
      setNewPocketName('');
      onRefresh();
    } catch (e: any) {
      toast.error('Gagal membuat kantong: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePocket = async (id: string) => {
    if (!editName.trim()) return setEditingId(null);
    setLoading(true);
    try {
      const { error } = await supabase.from('pockets').update({ name: editName.trim() }).eq('id', id);
      if (error) throw error;
      toast.success('Kantong diperbarui');
      setEditingId(null);
      onRefresh();
    } catch (e: any) {
      toast.error('Gagal memperbarui kantong: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePocket = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus kantong "${name}"? Pastikan tidak ada transaksi yang tertaut jika belum diperlukan.`)) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('pockets').delete().eq('id', id);
      if (error) throw error;
      toast.success('Kantong dihapus');
      onRefresh();
    } catch (e: any) {
      toast.error('Gagal menghapus kantong: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors group"
      >
        <WalletCards className="mr-2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
        <span className="font-semibold text-sm">Kelola Kantong Keuangan</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <WalletCards className="mr-2 h-5 w-5 text-blue-600" />
          Kelola Kantong Keuangan
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleAddPocket} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Nama Kantong Baru (Cth: Makan, Jajan, Tabungan)"
          value={newPocketName}
          onChange={(e) => setNewPocketName(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={loading || !newPocketName.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="h-5 w-5" />}
        </button>
      </form>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {pockets.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Belum ada kantong dibuat.</p>}
        {pockets.map((pocket) => (
          <div key={pocket.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 group">
            {editingId === pocket.id ? (
              <div className="flex items-center gap-2 flex-1 mr-4">
                <input
                  autoFocus
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
                <button onClick={() => handleUpdatePocket(pocket.id)} disabled={loading} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="font-medium text-sm text-gray-800">{pocket.name}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(pocket.id);
                      setEditName(pocket.name);
                    }}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePocket(pocket.id, pocket.name)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
