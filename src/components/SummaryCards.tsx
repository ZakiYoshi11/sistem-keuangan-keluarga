import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, cn } from '../lib/utils';
import { isSameMonth, parseISO } from 'date-fns';

export default function SummaryCards({ transactions }: { transactions: Transaction[] }) {
  const now = new Date();
  
  const currentMonthTransactions = transactions.filter(t => 
    isSameMonth(parseISO(t.transaction_date), now)
  );

  const totalPemasukan = currentMonthTransactions
    .filter(t => t.type === 'pemasukan')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPengeluaran = currentMonthTransactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const sisaSaldo = totalPemasukan - totalPengeluaran;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 transition-transform hover:scale-[1.02]">
        <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
          <ArrowUpCircle className="h-6 w-6" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-500 truncate">Pemasukan Bulan Ini</p>
          <p className="text-2xl font-bold text-gray-900 truncate">{formatRupiah(totalPemasukan)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 transition-transform hover:scale-[1.02]">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
          <ArrowDownCircle className="h-6 w-6" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-500 truncate">Pengeluaran Bulan Ini</p>
          <p className="text-2xl font-bold text-gray-900 truncate">{formatRupiah(totalPengeluaran)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 transition-transform hover:scale-[1.02]">
        <div className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
          sisaSaldo >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
        )}>
          <Wallet className="h-6 w-6" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-500 truncate">Sisa Saldo</p>
          <p className={cn(
            "text-2xl font-bold truncate",
            sisaSaldo >= 0 ? "text-gray-900" : "text-red-600"
          )}>{formatRupiah(sisaSaldo)}</p>
        </div>
      </div>
    </div>
  );
}
