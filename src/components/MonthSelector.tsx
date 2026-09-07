import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string; // YYYY-MM
  onChangeMonth: (yearMonth: string) => void;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onChangeMonth
}) => {
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  const thaiYear = year + 543;
  const monthName = THAI_MONTHS[month - 1] || '';

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onChangeMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onChangeMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${y}-${m}`);
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        id="month-selector-group"
        className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs"
      >
        <button
          id="btn-prev-month"
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
          title="เดือนก่อนหน้า"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="px-3 flex items-center gap-2 text-sm font-bold text-slate-800">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>
            {monthName} {thaiYear}
          </span>
        </div>

        <button
          id="btn-next-month"
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
          title="เดือนถัดไป"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <button
        id="btn-current-month"
        type="button"
        onClick={handleCurrentMonth}
        className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
      >
        เดือนปัจจุบัน
      </button>
    </div>
  );
};
