'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, Upload, RefreshCw, AlertTriangle, ChevronDown } from 'lucide-react';
import { Transaction, Analytics } from '@/utils/types';
import { analyzeTransactions } from '@/utils/analyzeTransactions';
import SummaryCards from '@/components/SummaryCards';
import Charts from '@/components/Charts';
import TransactionTable from '@/components/TransactionTable';
import FrequentPayees from '@/components/FrequentPayees';
import ExportButton from '@/components/ExportButton';

type Tab = 'overview' | 'transactions' | 'payees';

export default function DashboardPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('finsight_transactions');
      if (!stored) {
        router.push('/');
        return;
      }
      const txns = JSON.parse(stored) as Transaction[];
      setTransactions(txns);
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const analytics = useMemo<Analytics | null>(() => {
    if (!transactions.length) return null;
    return analyzeTransactions(transactions);
  }, [transactions]);

  const dateRange = useMemo(() => {
    if (!transactions.length) return '';
    const dates = transactions.map(t => t.date).filter(Boolean).sort();
    if (dates.length < 2) return dates[0] || '';
    const fmt = (d: string) => {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    };
    return `${fmt(dates[0])} — ${fmt(dates[dates.length - 1])}`;
  }, [transactions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#64748b] text-sm">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <AlertTriangle size={40} className="text-[#eab308] mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">No data found</h2>
          <p className="text-[#64748b] text-sm mb-6">Please upload a bank statement to get started.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-[#3b82f6] text-white rounded-xl text-sm font-medium hover:bg-[#2563eb] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'transactions', label: 'Transactions', count: transactions.length },
    { key: 'payees', label: 'Payees & Merchants', count: analytics.frequentPayees.length },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#0f172a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img src="/logo.png" alt="FinSight Logo" className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1" />
            <span className="text-white font-bold text-lg hidden sm:block" style={{ fontFamily: 'Syne, sans-serif' }}>FinSight</span>
          </button>

          {/* Date range */}
          {dateRange && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1e293b] border border-[#334155]">
              <span className="text-[#64748b] text-xs">Period:</span>
              <span className="text-[#94a3b8] text-xs font-mono">{dateRange}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ExportButton transactions={transactions} analytics={analytics} />
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#64748b] hover:text-white border border-[#334155] rounded-xl hover:border-[#475569] transition-all"
            >
              <Upload size={13} />
              <span className="hidden sm:inline">New File</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Page title & tabs */}
        <div>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Financial Dashboard
              </h1>
              <p className="text-[#64748b] text-sm mt-0.5">
                {transactions.length.toLocaleString()} transactions analyzed
              </p>
            </div>

            {/* Recurring badge */}
            {analytics.recurringPayments.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20">
                <RefreshCw size={13} className="text-[#3b82f6]" />
                <span className="text-[#3b82f6] text-xs font-medium">
                  {analytics.recurringPayments.length} recurring payments detected
                </span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#1e293b]">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px
                  ${activeTab === tab.key
                    ? 'text-white border-[#3b82f6]'
                    : 'text-[#64748b] border-transparent hover:text-[#94a3b8]'
                  }
                `}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`
                    px-1.5 py-0.5 rounded-full text-[10px] 
                    ${activeTab === tab.key ? 'bg-[#3b82f6]/20 text-[#3b82f6]' : 'bg-[#334155] text-[#64748b]'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <SummaryCards analytics={analytics} />
            <Charts analytics={analytics} />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="animate-fade-in">
            <TransactionTable transactions={transactions} />
          </div>
        )}

        {activeTab === 'payees' && (
          <div className="animate-fade-in">
            <FrequentPayees
              payees={analytics.frequentPayees}
              topMerchants={analytics.topMerchants}
            />

            {/* Recurring section */}
            {analytics.recurringPayments.length > 0 && (
              <div className="mt-5 bg-[#1e293b] border border-[#334155] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw size={16} className="text-[#3b82f6]" />
                  <h3 className="text-white font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Detected Recurring Payments
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analytics.recurringPayments.map(p => (
                    <div key={p.payee} className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a] border border-[#334155]">
                      <div>
                        <p className="text-white text-sm font-medium">{p.payee}</p>
                        <p className="text-[#64748b] text-xs">{p.count} times · {p.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#3b82f6] font-mono text-sm">₹{p.total.toLocaleString('en-IN')}</p>
                        <p className="text-[#475569] text-xs">total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
