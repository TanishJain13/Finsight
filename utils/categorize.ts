// Map of keywords to categories
const CATEGORY_MAP: { keywords: string[]; category: string }[] = [
  {
    keywords: ['swiggy', 'zomato', 'dominos', 'mcdonalds', 'kfc', 'starbucks', 'cafe', 'restaurant', 'food', 'pizza', 'burger', 'dine', 'biryani', 'kitchen', 'hotel', 'eat', 'chai', 'coffee'],
    category: 'Food & Dining',
  },
  {
    keywords: ['uber', 'ola', 'rapido', 'metro', 'irctc', 'makemytrip', 'redbus', 'goibibo', 'indigo', 'airindia', 'vistara', 'petrol', 'fuel', 'fastag', 'toll', 'parking', 'cab', 'taxi', 'train', 'flight', 'bus', 'travel'],
    category: 'Transport & Travel',
  },
  {
    keywords: ['amazon', 'flipkart', 'myntra', 'nykaa', 'ajio', 'meesho', 'shopping', 'store', 'mart', 'supermarket', 'grocery', 'bigbasket', 'zepto', 'blinkit', 'dunzo', 'dmart', 'reliance', 'jiomart'],
    category: 'Shopping',
  },
  {
    keywords: ['netflix', 'spotify', 'youtube', 'hotstar', 'jiocinema', 'prime', 'apple', 'disney', 'zee5', 'sonyliv', 'subscription', 'crunchyroll', 'lionsgate', 'bookmyshow', 'pvr', 'inox'],
    category: 'Entertainment',
  },
  {
    keywords: ['electricity', 'airtel', 'jio', 'bsnl', 'vodafone', 'vi', 'recharge', 'broadband', 'wifi', 'internet', 'cable', 'dth', 'tata', 'power', 'gas', 'water', 'utility', 'bill'],
    category: 'Bills & Utilities',
  },
  {
    keywords: ['hospital', 'pharmacy', 'medplus', 'apollo', 'netmeds', '1mg', 'doctor', 'clinic', 'health', 'medical', 'insurance', 'medicine', 'diagnostic', 'lab', 'wellness', 'fitness', 'gym'],
    category: 'Health & Medical',
  },
  {
    keywords: ['byju', 'unacademy', 'coursera', 'udemy', 'leetcode', 'school', 'college', 'university', 'fees', 'tuition', 'education', 'book', 'course', 'learning', 'edutech', 'skill'],
    category: 'Education',
  },
  {
    keywords: ['hdfc', 'icici', 'sbi', 'axis', 'kotak', 'loan', 'emi', 'mortgage', 'credit card', 'bank', 'finance', 'investment', 'mutual fund', 'zerodha', 'groww', 'upstox', 'nps', 'ppf', 'insurance'],
    category: 'Finance & Investments',
  },
  {
    keywords: ['rent', 'maintenance', 'housing', 'society', 'flat', 'apartment', 'property'],
    category: 'Housing',
  },
  {
    keywords: ['salary', 'stipend', 'payroll', 'income', 'wages', 'bonus', 'dividend', 'interest', 'refund', 'cashback', 'reward'],
    category: 'Income',
  },
];

/**
 * Categorize a transaction based on payee and description
 */
export function categorizeTransaction(payee: string, description: string): string {
  const text = `${payee} ${description}`.toLowerCase();

  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }

  // Default
  return 'Personal Transfer';
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#f97316',
  'Transport & Travel': '#3b82f6',
  'Shopping': '#a855f7',
  'Entertainment': '#ec4899',
  'Bills & Utilities': '#eab308',
  'Health & Medical': '#22c55e',
  'Education': '#06b6d4',
  'Finance & Investments': '#64748b',
  'Housing': '#84cc16',
  'Income': '#10b981',
  'Personal Transfer': '#94a3b8',
};
