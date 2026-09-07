import React, { useState } from 'react';
import { Transaction } from '../types';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  Tag, 
  Calendar
} from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  selectedMonth: string; // YYYY-MM
}

const CATEGORY_COLORS: Record<string, string> = {
  'อาหารและเครื่องดื่ม': '#EF4444',
  'การเดินทาง / ยานพาหนะ': '#F97316',
  'ช้อปปิ้ง / ซื้อของ': '#EC4899',
  'ที่อยู่อาศัย / ค่าเช่า': '#8B5CF6',
  'ค่าน้ำ / ค่าไฟ / เน็ต': '#3B82F6',
  'ความบันเทิง / พักผ่อน': '#06B6D4',
  'สุขภาพ / ยารักษาโรค': '#10B981',
  'การศึกษา / หนังสือ': '#6366F1',
  'ค่าใช้จ่ายอื่นๆ': '#64748B',
  'เงินเดือน / ค่าจ้าง': '#10B981',
  'งานเสริม / ฟรีแลนซ์': '#059669',
  'เงินปันผล / ดอกเบี้ย / ลงทุน': '#14B8A6',
  'โบนัส / รางวัล': '#84CC16',
  'รายได้จากการขาย / ธุรกิจ': '#F59E0B',
  'รายรับอื่นๆ': '#64748B',
};

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  totalIncome,
  totalExpense,
  selectedMonth
}) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'daily'>('expense');

  // Compute breakdown by category for expense
  const expenseByCategory: Record<string, number> = {};
  const incomeByCategory: Record<string, number> = {};

  // Compute daily trend for current month
  const dailyData: Record<number, { day: number; income: number; expense: number }> = {};
  const [yearStr, monthStr] = selectedMonth.split('-');
  const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    dailyData[i] = { day: i, income: 0, expense: 0 };
  }

  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    } else {
      incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
    }

    if (tx.date) {
      const dayNum = parseInt(tx.date.split('-')[2], 10);
      if (dailyData[dayNum]) {
        if (tx.type === 'expense') dailyData[dayNum].expense += tx.amount;
        if (tx.type === 'income') dailyData[dayNum].income += tx.amount;
      }
    }
  });

  const sortedExpenses = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);
  const sortedIncomes = Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1]);

  // Donut SVG generator helper
  const createDonutSegments = (data: [string, number][], total: number) => {
    if (total <= 0 || data.length === 0) return [];
    let cumulative = 0;
    return data.map(([cat, val]) => {
      const percentage = (val / total) * 100;
      const strokeDasharray = `${percentage} ${100 - percentage}`;
      const strokeDashoffset = 100 - cumulative + 25; // start from top (rotate -90deg equivalent)
      cumulative += percentage;
      const color = CATEGORY_COLORS[cat] || '#94A3B8';
      return { cat, val, percentage, strokeDasharray, strokeDashoffset, color };
    });
  };

  const currentCategories = activeTab === 'expense' ? sortedExpenses : sortedIncomes;
  const currentTotal = activeTab === 'expense' ? totalExpense : totalIncome;
  const donutSegments = createDonutSegments(currentCategories, currentTotal);

  // Daily Chart Max Value
  const maxDailyValue = Math.max(
    ...Object.values(dailyData).map((d) => Math.max(d.income, d.expense)),
    100
  );

  return (
    <div 
      id="analytics-charts-section"
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs mb-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-600" />
            กราฟวิเคราะห์ข้อมูลรายรับ-รายจ่าย
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            สรุปสัดส่วนตามหมวดหมู่และแนวโน้มการใช้จ่ายประจำเดือน
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            id="tab-chart-expense"
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'expense'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สัดส่วนรายจ่าย
          </button>
          <button
            id="tab-chart-income"
            type="button"
            onClick={() => setActiveTab('income')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'income'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สัดส่วนรายรับ
          </button>
          <button
            id="tab-chart-daily"
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'daily'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            แนวโน้มรายวัน
          </button>
        </div>
      </div>

      {activeTab !== 'daily' ? (
        <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Donut Chart Visual */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            {currentTotal > 0 ? (
              <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="4"
                  />
                  {donutSegments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="21"
                      cy="21"
                      r="15.91549430918954"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="4"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-400 font-medium">
                    {activeTab === 'expense' ? 'รายจ่ายรวม' : 'รายรับรวม'}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-slate-800">
                    ฿{currentTotal.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {currentCategories.length} หมวดหมู่
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 rounded-full border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                <Tag className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-xs text-slate-400">
                  ยังไม่มีข้อมูล{activeTab === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้
                </span>
              </div>
            )}
          </div>

          {/* Breakdown Bars List */}
          <div className="md:col-span-7 space-y-3">
            {currentCategories.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                กดปุ่ม "+ บันทึกรายการ" เพื่อเพิ่มข้อมูลรายรับรายจ่าย
              </div>
            ) : (
              currentCategories.map(([category, amount]) => {
                const percent = ((amount / currentTotal) * 100).toFixed(1);
                const color = CATEGORY_COLORS[category] || '#64748B';
                return (
                  <div key={category} className="group">
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-slate-700 font-semibold">{category}</span>
                        <span className="text-slate-400 text-[11px]">({percent}%)</span>
                      </div>
                      <span className="text-slate-900 font-bold">
                        ฿{amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Daily Bar Trend */
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                รายรับ
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
                รายจ่าย
              </span>
            </div>
            <span className="text-xs text-slate-400">แกนนอน: วันที่ 1 - {daysInMonth}</span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[600px] h-48 flex items-end gap-1.5 border-b border-slate-200 pt-6 px-2">
              {Object.values(dailyData).map(({ day, income, expense }) => {
                const incomeHeightPercent = maxDailyValue > 0 ? (income / maxDailyValue) * 100 : 0;
                const expenseHeightPercent = maxDailyValue > 0 ? (expense / maxDailyValue) * 100 : 0;
                const hasActivity = income > 0 || expense > 0;

                return (
                  <div 
                    key={day} 
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip on hover */}
                    {hasActivity && (
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl z-20 whitespace-nowrap pointer-events-none">
                        <span className="font-bold border-b border-slate-700 pb-1 mb-1">
                          วันที่ {day}
                        </span>
                        {income > 0 && (
                          <span className="text-emerald-400">รับ: +฿{income.toLocaleString()}</span>
                        )}
                        {expense > 0 && (
                          <span className="text-rose-400">จ่าย: -฿{expense.toLocaleString()}</span>
                        )}
                      </div>
                    )}

                    {/* Bars */}
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      <div 
                        style={{ height: `${Math.max(incomeHeightPercent, income > 0 ? 8 : 0)}%` }}
                        className={`w-full max-w-[6px] rounded-t-xs transition-all duration-300 ${
                          income > 0 ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-transparent'
                        }`}
                      />
                      <div 
                        style={{ height: `${Math.max(expenseHeightPercent, expense > 0 ? 8 : 0)}%` }}
                        className={`w-full max-w-[6px] rounded-t-xs transition-all duration-300 ${
                          expense > 0 ? 'bg-rose-500 group-hover:bg-rose-400' : 'bg-transparent'
                        }`}
                      />
                    </div>

                    <span className={`text-[10px] mt-2 font-mono ${hasActivity ? 'text-slate-700 font-bold' : 'text-slate-400'}`}>
                      {day % 2 === 1 ? day : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
