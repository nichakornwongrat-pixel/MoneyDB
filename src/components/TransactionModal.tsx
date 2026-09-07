import React, { useState } from 'react';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Calendar, Tag, FileText } from 'lucide-react';
import { DEFAULT_CATEGORIES, Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState<string>(initialData ? initialData.amount.toString() : '');
  const [category, setCategory] = useState<string>(
    initialData?.category || (type === 'expense' ? 'อาหารและเครื่องดื่ม' : 'เงินเดือน / ค่าจ้าง')
  );
  const [date, setDate] = useState<string>(
    initialData?.date || new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState<string>(initialData?.note || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredCategories = DEFAULT_CATEGORIES.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('กรุณากรอกจำนวนเงินที่ถูกต้อง');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        type,
        amount: numAmount,
        category,
        date,
        note: note.trim()
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = DEFAULT_CATEGORIES.find((c) => c.type === newType);
    if (firstCat) setCategory(firstCat.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="transaction-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h2>
          <button
            id="btn-close-modal"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Type selector */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
            <button
              id="btn-type-expense"
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              รายจ่าย
            </button>
            <button
              id="btn-type-income"
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              รายรับ
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ฿
              </span>
              <input
                id="input-transaction-amount"
                type="number"
                step="any"
                min="0"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              หมวดหมู่ *
            </label>
            <select
              id="select-transaction-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              วันที่ทำรายการ *
            </label>
            <input
              id="input-transaction-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <input
              id="input-transaction-note"
              type="text"
              placeholder="เช่น ซื้อกาแฟสดยามเช้า, ข้าวเที่ยง"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              id="btn-cancel-transaction"
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              id="btn-submit-transaction"
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? 'กำลังบันทึก...' : initialData ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
