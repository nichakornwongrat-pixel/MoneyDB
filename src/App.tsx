import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Transaction } from './types';
import { AuthBar } from './components/AuthBar';
import { SummaryCards } from './components/SummaryCards';
import { MonthSelector } from './components/MonthSelector';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { 
  Plus, 
  Wallet, 
  Database, 
  Lock, 
  Sparkles,
  Download
} from 'lucide-react';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Current selected month: YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Listen to Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore transactions for this user
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: data.userId,
            type: data.type,
            amount: Number(data.amount) || 0,
            category: data.category || 'อื่นๆ',
            note: data.note || '',
            date: data.date || '',
            createdAt: data.createdAt ? data.createdAt.toString() : ''
          });
        });

        // Sort descending by date
        list.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
        setTransactions(list);
        setLoadingData(false);
      },
      (error) => {
        console.error('Error fetching transactions from Firestore:', error);
        setLoadingData(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Filter transactions for the selected month
  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Formatted Month Name
  const [yStr, mStr] = selectedMonth.split('-');
  const monthIdx = parseInt(mStr, 10) - 1;
  const thaiYear = parseInt(yStr, 10) + 543;
  const formattedMonthName = `${THAI_MONTHS[monthIdx] || ''} ${thaiYear}`;

  // CRUD Handlers
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    if (editingTransaction && editingTransaction.id) {
      // Update
      const docRef = doc(db, 'transactions', editingTransaction.id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create
      await addDoc(collection(db, 'transactions'), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'transactions', id);
    await deleteDoc(docRef);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (monthTransactions.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออกในเดือนนี้');
      return;
    }
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'บันทึก'];
    const rows = monthTransactions.map((tx) => [
      tx.date,
      tx.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${tx.category.replace(/"/g, '""')}"`,
      tx.amount,
      `"${(tx.note || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MoneyDB-Report-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <AuthBar user={user} loading={authLoading} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {!user && !authLoading ? (
          /* Landing state when not signed in */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm text-center max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-xs border border-indigo-100 p-1">
              <img
                src="/college_logo.jpg"
                alt="ตราสัญลักษณ์ วิทยาลัยอาชีวศึกษาแพร่"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              ยินดีต้อนรับสู่ MoneyDB
            </h2>
            <p className="text-indigo-600 font-bold text-sm mt-1">
              วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College)
            </p>
            <p className="text-slate-500 mt-2 text-sm sm:text-base leading-relaxed">
              จัดการบันทึกรายรับรายจ่าย พร้อมระบบสรุปผลประจำเดือน กราฟวิเคราะห์สัดส่วน 
              และเชื่อมต่อเก็บข้อมูลปลอดภัยบนคลาวด์ Firebase Firestore แบบเรียลไทม์
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="btn-login-hero"
                type="button"
                onClick={() => {
                  const btn = document.getElementById('btn-sign-in-google');
                  if (btn) btn.click();
                }}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                เข้าสู่ระบบด้วย Gmail เพื่อเริ่มต้นใช้งาน
              </button>
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-8 text-left">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-xs text-indigo-700 block">📊 วิเคราะห์กราฟ</span>
                <p className="text-xs text-slate-500 mt-1">แบ่งสัดส่วนรายรับรายจ่ายตามหมวดหมู่และรายวัน</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-xs text-indigo-700 block">🗓️ สรุปรายเดือน</span>
                <p className="text-xs text-slate-500 mt-1">เลือกดูย้อนหลังและเปรียบเทียบยอดคงเหลือได้ง่าย</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-xs text-indigo-700 block">☁️ Firebase Realtime</span>
                <p className="text-xs text-slate-500 mt-1">ข้อมูลถูกจัดเก็บบน Cloud Firestore ซิงค์ทันที</p>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div>
            {/* Action & Month Selection Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <MonthSelector
                selectedMonth={selectedMonth}
                onChangeMonth={setSelectedMonth}
              />

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  id="btn-export-csv"
                  type="button"
                  onClick={handleExportCSV}
                  title="ดาวน์โหลดรายงานเป็น CSV"
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">ส่งออก CSV</span>
                </button>

                <button
                  id="btn-add-transaction-open"
                  type="button"
                  onClick={handleOpenAddModal}
                  className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  + บันทึกรายการ
                </button>
              </div>
            </div>

            {/* Top Stat Summary Cards */}
            <SummaryCards
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              selectedMonthName={formattedMonthName}
            />

            {/* Graphical Analytics Section */}
            <AnalyticsCharts
              transactions={monthTransactions}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              selectedMonth={selectedMonth}
            />

            {/* Transactions History Table/List */}
            <TransactionList
              transactions={monthTransactions}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTransaction}
              selectedMonthName={formattedMonthName}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>MoneyDB • ระบบบันทึกรายรับรายจ่าย วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College) • Firebase Firestore</p>
      </footer>

      {/* Transaction Modal (Add/Edit) */}
      <TransactionModal
        key={editingTransaction ? editingTransaction.id : 'new'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />
    </div>
  );
}
