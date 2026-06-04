import React from 'react';
import { Pocket, Transaction } from '../types';
import { formatRupiah } from '../lib/utils';
import { Wallet } from 'lucide-react';

export default function PocketBalances({ pockets, transactions }: { pockets: Pocket[], transactions: Transaction[] }) {
  if (pockets.length === 0) return null;

  const pocketBalances = pockets.map(pocket => {
    const pocketTxs = transactions.filter(t => t.pocket_id === pocket.id);
    const pemasukan = pocketTxs.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
    const pengeluaran = pocketTxs.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0);
    return {
      ...pocket,
      balance: pemasukan - pengeluaran
    };
  });

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
         <Wallet className="mr-2 h-5 w-5 text-gray-400" /> Saldo Per Kantong
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pocketBalances.map(pocket => (
          <div key={pocket.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-md">
            <span className="text-sm font-medium text-gray-500 mb-2 truncate">{pocket.name}</span>
            <div>
              <p className={`text-xl font-bold truncate ${pocket.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatRupiah(pocket.balance)}
              </p>
            </div>
            {/* Visual Indicator Line */}
            <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full ${pocket.balance > 0 ? 'bg-blue-500' : pocket.balance < 0 ? 'bg-red-500' : 'bg-gray-300'}`} 
                 style={{ width: pocket.balance === 0 ? '0%' : '100%' }}
               />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
