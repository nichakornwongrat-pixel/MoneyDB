import React from 'react';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  TrendingDown, 
  TrendingUp,
  Percent
} from 'lucide-react';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  selectedMonthName: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  selectedMonthName
}) => {
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((balance / totalIncome) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Balance Card */}
      <div 
        id="card-balance-summary"
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ยอดเงินสุทธิ ({selectedMonthName})
          </span>
          <div className={`p-2 rounded-xl ${balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl font-black ${balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
            ฿{balance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {balance >= 0 ? 'เงินคงเหลือสะสมในเดือนนี้' : 'รายจ่ายเกินรายรับในเดือนนี้'}
          </p>
        </div>
      </div>

      {/* Total Income Card */}
      <div 
        id="card-income-summary"
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            รายรับรวม
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowUpCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-emerald-600">
            +฿{totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 inline" />
            รายได้ทุกช่องทาง
          </p>
        </div>
      </div>

      {/* Total Expense Card */}
      <div 
        id="card-expense-summary"
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
            รายจ่ายรวม
          </span>
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <ArrowDownCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-rose-600">
            -฿{totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500 inline" />
            ค่าใช้จ่ายทั้งหมด
          </p>
        </div>
      </div>

      {/* Savings Rate Card */}
      <div 
        id="card-savings-summary"
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            อัตราการออมเงิน
          </span>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Percent className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-800">
            {savingsRate}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
