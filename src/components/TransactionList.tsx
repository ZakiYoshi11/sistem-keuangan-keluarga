import React from 'react';
import { Transaction } from '../types';
import { formatRupiah, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { id as dateId } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function TransactionList({ transactions, onRefresh }: { transactions: Transaction[], onRefresh: () => void }) {
  const { role } = useAuth();

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return;
    
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Transaksi dihapus');
      onRefresh();
    } catch (e: any) {
      toast.error('Gagal hapus: ' + e.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-white">
        <h3 className="text-lg font-bold text-gray-900">Riwayat Transaksi Terakhir</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nominal</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Catatan</th>
              {role === 'admin' && <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {format(parseISO(t.transaction_date), 'dd MMM yyyy', { locale: dateId })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {t.pockets?.name || t.category}
                </td>
                <td className={cn(
                  "px-6 py-4 whitespace-nowrap text-sm font-bold",
                  t.type === 'pemasukan' ? "text-green-600" : "text-red-500"
                )}>
                  {t.type === 'pemasukan' ? '+' : '-'}{formatRupiah(t.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {t.notes || '-'}
                </td>
                {role === 'admin' && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg inline-flex items-center"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={role === 'admin' ? 5 : 4} className="px-6 py-12 text-center text-sm text-gray-500">
                  Belum ada transaksi tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
