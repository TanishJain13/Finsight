export interface Transaction {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  payee: string;
  category: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface FrequentPayee {
  payee: string;
  count: number;
  total: number;
  category: string;
  isRecurring: boolean;
}

export interface Analytics {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  monthlyData: MonthlyData[];
  categorySpending: CategorySpending[];
  frequentPayees: FrequentPayee[];
  topMerchants: FrequentPayee[];
  recurringPayments: FrequentPayee[];
  avgMonthlyExpense: number;
  avgMonthlyIncome: number;
}
