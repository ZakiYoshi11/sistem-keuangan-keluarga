import React from 'react';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatRupiah } from '../lib/utils';
import { isSameMonth, parseISO } from 'date-fns';

export default function DashboardCharts({ transactions }: { transactions: Transaction[] }) {
  const now = new Date();
  
  // Aggregate expenses by category for current month
  const expenses = transactions.filter(t => 
    t.type === 'pengeluaran' && isSameMonth(parseISO(t.transaction_date), now)
  );
  
  const categoryData = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.keys(categoryData).map(key => ({
    name: key,
    value: categoryData[key],
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

  if (transactions.length === 0 || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex items-center justify-center min-h-[300px]">
        <p className="text-gray-400 font-medium">Beban pengeluaran bulan ini belum ada.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Proporsi Pengeluaran Bulan Ini</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatRupiah(value)}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
