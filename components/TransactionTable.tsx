'use client';
import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { Transaction } from '@/utils/types';
import { CATEGORY_COLORS } from '@/utils/categorize';

interface TransactionTableProps {
  transactions: Transaction[];
}

type SortKey = 'date' | 'payee' | 'description' | 'category' | 'debit' | 'credit';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 20;

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(transactions.map(t => t.category))).sort();
    return ['all', ...cats];
  }, [transactions]);

  const filtered = useMemo(() => {
    let result = transactions;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.payee.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }

    result = [...result].sort((a, b) => {
      let va: any = a[sortKey];
      let vb: any = b[sortKey];
      if (sortKey === 'date') {
        va = new Date(a.date).getTime() || 0;
        vb = new Date(b.date).getTime() || 0;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, search, categoryFilter, sortKey, sortDir]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k
      ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
      : <ChevronDown size={13} className="opacity-30" />
  );

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[#334155] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search transactions..."
            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#3b82f6] transition-colors"
          />
        </div>

        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(0); }}
            className="bg-[#0f172a] border border-[#334155] rounded-lg pl-8 pr-8 py-2 text-sm text-white focus:outline-none focus:border-[#3b82f6] appearance-none cursor-pointer transition-colors"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>

        <div className="text-[#64748b] text-sm self-center whitespace-nowrap">
          {filtered.length.toLocaleString()} transactions
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#334155]">
              {[
                { key: 'date', label: 'Date', cls: 'w-28' },
                { key: 'payee', label: 'Payee', cls: 'min-w-[140px]' },
                { key: 'description' as SortKey, label: 'Description', cls: 'min-w-[200px]' },
                { key: 'category', label: 'Category', cls: 'w-36' },
                { key: 'debit', label: 'Debit', cls: 'w-28 text-right' },
                { key: 'credit', label: 'Credit', cls: 'w-28 text-right' },
              ].map(col => (
                <th
                  key={col.label}
                  onClick={() => col.key && handleSort(col.key as SortKey)}
                  className={`
                    px-4 py-3 text-left text-xs text-[#64748b] uppercase tracking-wider
                    ${col.key ? 'cursor-pointer hover:text-white select-none' : ''}
                    ${col.cls}
                  `}
                >
                  <div className={`flex items-center gap-1 ${col.cls.includes('right') ? 'justify-end' : ''}`}>
                    {col.label}
                    {col.key && <SortIcon k={col.key as SortKey} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((t, i) => (
              <tr
                key={t.id}
                className="border-b border-[#1e293b] hover:bg-[#3b82f6]/5 transition-colors"
                style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(15,23,42,0.3)' }}
              >
                <td className="px-4 py-3 text-[#94a3b8] text-xs font-mono whitespace-nowrap">
                  {t.date || '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="text-white font-medium text-sm truncate block max-w-[160px]">{t.payee}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[#64748b] text-xs truncate block max-w-[240px]" title={t.description}>
                    {t.description}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{
                      background: `${CATEGORY_COLORS[t.category] || '#94a3b8'}20`,
                      color: CATEGORY_COLORS[t.category] || '#94a3b8',
                    }}
                  >
                    {t.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {t.debit > 0 ? (
                    <span className="text-red-400 font-mono text-sm">
                      −₹{t.debit.toLocaleString('en-IN')}
                    </span>
                  ) : <span className="text-[#475569]">—</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  {t.credit > 0 ? (
                    <span className="text-[#22c55e] font-mono text-sm">
                      +₹{t.credit.toLocaleString('en-IN')}
                    </span>
                  ) : <span className="text-[#475569]">—</span>}
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#475569]">
                  No transactions match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-[#334155] flex items-center justify-between">
          <p className="text-[#64748b] text-xs">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#334155] text-white disabled:opacity-30 hover:bg-[#475569] transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-7 text-xs rounded-lg transition-colors ${
                    p === page
                      ? 'bg-[#3b82f6] text-white'
                      : 'bg-[#334155] text-[#94a3b8] hover:bg-[#475569]'
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#334155] text-white disabled:opacity-30 hover:bg-[#475569] transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
