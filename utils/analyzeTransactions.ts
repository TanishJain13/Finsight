import { Transaction, Analytics, MonthlyData, CategorySpending, FrequentPayee } from './types';
import { CATEGORY_COLORS } from './categorize';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function analyzeTransactions(transactions: Transaction[]): Analytics {
  const totalIncome = transactions.reduce((sum, t) => sum + t.credit, 0);
  const totalExpenses = transactions.reduce((sum, t) => sum + t.debit, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  // --- Monthly Breakdown ---
  const monthlyMap = new Map<string, { income: number; expenses: number }>();

  transactions.forEach(t => {
    if (!t.date) return;
    const d = new Date(t.date);
    if (isNaN(d.getTime())) return;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const current = monthlyMap.get(key) || { income: 0, expenses: 0 };
    current.income += t.credit;
    current.expenses += t.debit;
    monthlyMap.set(key, current);
  });

  const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      const [year, month] = key.split('-');
      return {
        month: `${MONTH_NAMES[parseInt(month) - 1]} '${year.slice(2)}`,
        income: Math.round(data.income),
        expenses: Math.round(data.expenses),
        savings: Math.round(data.income - data.expenses),
      };
    });

  // --- Category Breakdown ---
  const categoryMap = new Map<string, number>();
  transactions
    .filter(t => t.debit > 0)
    .forEach(t => {
      const cat = t.category === 'Income' ? 'Personal Transfer' : t.category;
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.debit);
    });

  const categorySpending: CategorySpending[] = Array.from(categoryMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount),
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: CATEGORY_COLORS[category] || '#94a3b8',
    }));

  // --- Frequent Payees ---
  const payeeMap = new Map<string, { count: number; total: number; category: string }>();

  transactions.forEach(t => {
    if (!t.payee || t.debit === 0) return;
    const existing = payeeMap.get(t.payee) || { count: 0, total: 0, category: t.category };
    existing.count += 1;
    existing.total += t.debit;
    payeeMap.set(t.payee, existing);
  });

  const frequentPayees: FrequentPayee[] = Array.from(payeeMap.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15)
    .map(([payee, data]) => ({
      payee,
      count: data.count,
      total: Math.round(data.total),
      category: data.category,
      isRecurring: data.count >= 2,
    }));

  // --- Top Merchants (by amount) ---
  const topMerchants: FrequentPayee[] = Array.from(payeeMap.entries())
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 10)
    .map(([payee, data]) => ({
      payee,
      count: data.count,
      total: Math.round(data.total),
      category: data.category,
      isRecurring: data.count >= 2,
    }));

  // --- Recurring Payments ---
  const recurringPayments = frequentPayees.filter(p => p.isRecurring);

  const monthCount = monthlyData.length || 1;
  const avgMonthlyExpense = totalExpenses / monthCount;
  const avgMonthlyIncome = totalIncome / monthCount;

  return {
    totalIncome: Math.round(totalIncome),
    totalExpenses: Math.round(totalExpenses),
    savings: Math.round(savings),
    savingsRate: Math.round(savingsRate * 10) / 10,
    monthlyData,
    categorySpending,
    frequentPayees,
    topMerchants,
    recurringPayments,
    avgMonthlyExpense: Math.round(avgMonthlyExpense),
    avgMonthlyIncome: Math.round(avgMonthlyIncome),
  };
}
