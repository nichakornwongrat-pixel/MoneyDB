import React, { useState } from 'react';
import { Transaction } from '../types';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Trash2, 
  Edit3, 
  Search, 
  Filter,
  Calendar,
  Layers
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  selectedMonthName: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  selectedMonthName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract unique categories from current list
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchNote = (tx.note || '').toLowerCase().includes(q);
      const matchAmount = tx.amount.toString().includes(q);
      if (!matchCat && !matchNote && !matchAmount) return false;
    }
    return true;
  });

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div 
      id="transaction-history-section"
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            ประวัติรายการ ({selectedMonthName})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            แสดงรายการทั้งหมด {filtered.length} จาก {transactions.length} รายการ
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-transaction"
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <select
            id="select-filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">ทั้งหมด</option>
            <option value="income">รายรับ (+)</option>
            <option value="expense">รายจ่าย (-)</option>
          </select>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              id="select-filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 max-w-[140px] truncate"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-slate-100 mt-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            ไม่พบรายการรายรับรายจ่ายที่ตรงกับเงื่อนไข
          </div>
        ) : (
          filtered.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                id={`transaction-item-${tx.id}`}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 px-2 rounded-xl transition-colors group"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isIncome
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpCircle className="w-5 h-5" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm truncate">
                        {tx.category}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                        {tx.date}
                      </span>
                    </div>
                    {tx.note ? (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {tx.note}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-0.5">ไม่มีบันทึกช่วยจำ</p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-base font-black ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'}฿
                      {tx.amount.toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`btn-edit-tx-${tx.id}`}
                      type="button"
                      title="แก้ไข"
                      onClick={() => onEdit(tx)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-delete-tx-${tx.id}`}
                      type="button"
                      title="ลบ"
                      disabled={deletingId === tx.id}
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
