export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  createdAt?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  // Expenses
  { id: 'food', name: 'อาหารและเครื่องดื่ม', icon: 'Utensils', color: '#EF4444', type: 'expense' },
  { id: 'transport', name: 'การเดินทาง / ยานพาหนะ', icon: 'Car', color: '#F97316', type: 'expense' },
  { id: 'shopping', name: 'ช้อปปิ้ง / ซื้อของ', icon: 'ShoppingBag', color: '#EC4899', type: 'expense' },
  { id: 'housing', name: 'ที่อยู่อาศัย / ค่าเช่า', icon: 'Home', color: '#8B5CF6', type: 'expense' },
  { id: 'bills', name: 'ค่าน้ำ / ค่าไฟ / เน็ต', icon: 'Zap', color: '#3B82F6', type: 'expense' },
  { id: 'entertainment', name: 'ความบันเทิง / พักผ่อน', icon: 'Film', color: '#06B6D4', type: 'expense' },
  { id: 'health', name: 'สุขภาพ / ยารักษาโรค', icon: 'HeartPulse', color: '#10B981', type: 'expense' },
  { id: 'education', name: 'การศึกษา / หนังสือ', icon: 'GraduationCap', color: '#6366F1', type: 'expense' },
  { id: 'other_expense', name: 'ค่าใช้จ่ายอื่นๆ', icon: 'MoreHorizontal', color: '#64748B', type: 'expense' },
  
  // Incomes
  { id: 'salary', name: 'เงินเดือน / ค่าจ้าง', icon: 'Briefcase', color: '#10B981', type: 'income' },
  { id: 'freelance', name: 'งานเสริม / ฟรีแลนซ์', icon: 'Laptop', color: '#059669', type: 'income' },
  { id: 'investment', name: 'เงินปันผล / ดอกเบี้ย / ลงทุน', icon: 'TrendingUp', color: '#14B8A6', type: 'income' },
  { id: 'bonus', name: 'โบนัส / รางวัล', icon: 'Gift', color: '#84CC16', type: 'income' },
  { id: 'business', name: 'รายได้จากการขาย / ธุรกิจ', icon: 'Store', color: '#F59E0B', type: 'income' },
  { id: 'other_income', name: 'รายรับอื่นๆ', icon: 'Coins', color: '#64748B', type: 'income' }
];

export interface MonthlySummary {
  yearMonth: string; // YYYY-MM
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  expenseByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
}
