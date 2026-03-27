'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Zap, BarChart2, FileSpreadsheet, ChevronRight, Lock, Eye, ArrowRight } from 'lucide-react';
import UploadBox from '@/components/UploadBox';
import { Transaction } from '@/utils/types';

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Analysis',
    desc: 'Parse hundreds of transactions in under a second. Automatic categorization and payee detection.',
    color: '#eab308',
  },
  {
    icon: BarChart2,
    title: 'Visual Reports',
    desc: 'Beautiful charts: monthly trends, spending breakdown, income vs expenses — at a glance.',
    color: '#3b82f6',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    desc: 'Your data never leaves your device. All processing happens locally in the browser.',
    color: '#22c55e',
  },
  {
    icon: FileSpreadsheet,
    title: 'Excel Export',
    desc: 'Download a professionally formatted Excel report with 4 sheets of financial data.',
    color: '#a855f7',
  },
];

const STATS = [
  { value: '100%', label: 'Privacy preserved' },
  { value: '<1s', label: 'Parse time' },
  { value: '4+', label: 'Report sheets' },
  { value: '∞', label: 'Transactions' },
];

export default function LandingPage() {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);

  const handleTransactions = (txns: Transaction[]) => {
    sessionStorage.setItem('finsight_transactions', JSON.stringify(txns));
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-overlay pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #3b82f6 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #22c55e 0%, transparent 70%)' }}
      />

      {/* Nav */}
      <nav className="relative z-10 border-b border-[#1e293b] bg-[#0f172a]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="FinSight Logo" className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1" />
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>FinSight</span>
          </div>
          <div className="flex items-center gap-2 text-[#64748b] text-xs">
            <Lock size={11} className="text-[#22c55e]" />
            <span>100% local processing</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#334155] bg-[#1e293b]/50 text-xs text-[#94a3b8] mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            No sign-up required · Completely free · Runs in your browser
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 animate-slide-up"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Understand Your<br />
            <span className="gradient-text">Money in Seconds</span>
          </h1>

          <p className="text-[#94a3b8] text-lg max-w-xl mx-auto mb-10 animate-slide-up stagger-2" style={{ animationFillMode: 'both' }}>
            Upload your bank statement and instantly get charts, spending insights, and financial reports — all processed locally.
          </p>

          {/* CTA */}
          {!showUpload ? (
            <div className="flex flex-col sm:flex-row gap-3 animate-slide-up stagger-3" style={{ animationFillMode: 'both' }}>
              <button
                onClick={() => setShowUpload(true)}
                className="group flex items-center gap-2 px-8 py-3.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-glow-blue"
              >
                Upload Statement
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  // Load demo data
                  const demo = generateDemoData();
                  sessionStorage.setItem('finsight_transactions', JSON.stringify(demo));
                  router.push('/dashboard');
                }}
                className="flex items-center gap-2 px-8 py-3.5 bg-[#1e293b] hover:bg-[#243347] text-white rounded-xl font-semibold text-base border border-[#334155] transition-all duration-200"
              >
                View Demo
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div className="w-full max-w-2xl animate-slide-up" style={{ animationFillMode: 'both' }}>
              <UploadBox onTransactions={handleTransactions} />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="text-center p-4 rounded-xl bg-[#1e293b]/50 border border-[#334155]/50 animate-slide-up"
              style={{ animationDelay: `${0.1 * i}s`, animationFillMode: 'both' }}
            >
              <p className="text-2xl font-bold gradient-text" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</p>
              <p className="text-[#64748b] text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-[#1e293b]">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
            Everything you need to understand your finances
          </h2>
          <p className="text-[#64748b] text-base max-w-lg mx-auto">
            Built for privacy-conscious users who want powerful analysis without sharing their data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-[#1e293b] border border-[#334155] hover:border-[#475569] transition-all duration-300 hover:scale-[1.02] hover:shadow-card-lg animate-slide-up"
                style={{ animationDelay: `${0.1 * i}s`, animationFillMode: 'both' }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}15` }}
                >
                  <Icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {f.title}
                </h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-[#1e293b]">
        <div className="rounded-2xl bg-gradient-to-r from-[#22c55e]/10 to-[#3b82f6]/10 border border-[#22c55e]/20 p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-16 h-16 rounded-2xl bg-[#22c55e]/15 flex items-center justify-center flex-shrink-0">
            <Eye size={28} className="text-[#22c55e]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-white text-xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Your data stays on your device. Period.
            </h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed max-w-xl">
              FinSight uses modern browser APIs to parse and analyze your bank statements entirely in memory.
              We have no server, no database, no analytics. Your sensitive financial data is never transmitted anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1e293b] py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-[#475569] text-xs">
          <p>FinSight — Privacy-first financial analytics <br></br> Built with ❤️ By Tanish Jain · All processing happens in your browser</p>
        </div>
      </footer>
    </main>
  );
}

// Generate realistic demo data
function generateDemoData() {
  const merchants = [
    { name: 'Swiggy', cat: 'Food & Dining', avg: 350, freq: 12 },
    { name: 'Zomato', cat: 'Food & Dining', avg: 420, freq: 8 },
    { name: 'Uber', cat: 'Transport & Travel', avg: 180, freq: 15 },
    { name: 'Amazon', cat: 'Shopping', avg: 890, freq: 10 },
    { name: 'Netflix', cat: 'Entertainment', avg: 799, freq: 3 },
    { name: 'Spotify', cat: 'Entertainment', avg: 119, freq: 3 },
    { name: 'Airtel', cat: 'Bills & Utilities', avg: 599, freq: 3 },
    { name: 'Flipkart', cat: 'Shopping', avg: 1200, freq: 5 },
    { name: 'BigBasket', cat: 'Shopping', avg: 1500, freq: 4 },
    { name: 'Apollo Pharmacy', cat: 'Health & Medical', avg: 450, freq: 3 },
    { name: 'Rahul Sharma', cat: 'Personal Transfer', avg: 1000, freq: 4 },
    { name: 'Udemy', cat: 'Education', avg: 399, freq: 2 },
  ];

  const transactions: any[] = [];
  const now = new Date();
  let id = 1;

  // 3 months of data
  for (let m = 2; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);

    // Salary
    const salary = 75000 + Math.round((Math.random() - 0.5) * 5000);
    transactions.push({
      id: `demo-${id++}`,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0],
      description: 'NEFT/EMPLOYER PAYROLL SALARY',
      debit: 0,
      credit: salary,
      payee: 'Employer',
      category: 'Income',
    });

    // Transactions per merchant
    for (const merchant of merchants) {
      const count = Math.ceil(merchant.freq / 3) + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const day = 1 + Math.floor(Math.random() * 28);
        const amount = Math.round(merchant.avg * (0.7 + Math.random() * 0.6));
        transactions.push({
          id: `demo-${id++}`,
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day).toISOString().split('T')[0],
          description: `UPI/${merchant.name.toUpperCase()}/ORDER${Math.floor(Math.random() * 9000) + 1000}`,
          debit: amount,
          credit: 0,
          payee: merchant.name,
          category: merchant.cat,
        });
      }
    }

    // Rent
    transactions.push({
      id: `demo-${id++}`,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5).toISOString().split('T')[0],
      description: 'NEFT/HOUSE RENT PAYMENT',
      debit: 22000,
      credit: 0,
      payee: 'Landlord',
      category: 'Housing',
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
