'use client';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { FrequentPayee } from '@/utils/types';
import { CATEGORY_COLORS } from '@/utils/categorize';

interface FrequentPayeesProps {
  payees: FrequentPayee[];
  topMerchants: FrequentPayee[];
}

function PayeeCard({ payee, maxTotal }: { payee: FrequentPayee; maxTotal: number }) {
  const color = CATEGORY_COLORS[payee.category] || '#94a3b8';
  const barWidth = maxTotal > 0 ? (payee.total / maxTotal) * 100 : 0;

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-[#334155] hover:border-[#475569] hover:bg-[#243347] transition-all duration-200">
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
        style={{ background: `${color}20`, color }}
      >
        {payee.payee.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-white text-sm font-medium truncate">{payee.payee}</span>
            {payee.isRecurring && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-[10px] rounded-full whitespace-nowrap flex-shrink-0">
                <RefreshCw size={8} />
                Recurring
              </span>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-white font-mono text-sm">₹{payee.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: `${color}15`, color }}
          >
            {payee.category}
          </span>
          <span className="text-[#64748b] text-xs">{payee.count} txns</span>
        </div>

        {/* Amount bar */}
        <div className="h-1 bg-[#334155] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${barWidth}%`, background: color }}
          />
        </div>
      </div>
    </div>
  );
}

export default function FrequentPayees({ payees, topMerchants }: FrequentPayeesProps) {
  const maxTotal = Math.max(...payees.map(p => p.total), 1);
  const maxMerchantTotal = Math.max(...topMerchants.map(p => p.total), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Frequent Payees */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
              Frequent Payees
            </h3>
            <p className="text-[#64748b] text-xs mt-0.5">People & merchants you pay most often</p>
          </div>
          <RefreshCw size={16} className="text-[#3b82f6]" />
        </div>

        <div className="space-y-2">
          {payees.slice(0, 8).map(p => (
            <PayeeCard key={p.payee} payee={p} maxTotal={maxTotal} />
          ))}
          {payees.length === 0 && (
            <p className="text-[#475569] text-sm text-center py-8">No frequent payees detected.</p>
          )}
        </div>
      </div>

      {/* Top Merchants by Spend */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
              Top Spending
            </h3>
            <p className="text-[#64748b] text-xs mt-0.5">Where your money goes most</p>
          </div>
          <TrendingUp size={16} className="text-[#22c55e]" />
        </div>

        <div className="space-y-2">
          {topMerchants.slice(0, 8).map((p, i) => {
            const color = CATEGORY_COLORS[p.category] || '#94a3b8';
            return (
              <div key={p.payee} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#243347] transition-colors">
                <span className="text-[#475569] font-mono text-xs w-5 text-center">{i + 1}</span>

                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: `${color}20`, color }}
                >
                  {p.payee.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm truncate">{p.payee}</span>
                    <span className="text-white font-mono text-sm ml-2 flex-shrink-0">
                      ₹{p.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#334155] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(p.total / maxMerchantTotal) * 100}%`,
                        background: color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {topMerchants.length === 0 && (
            <p className="text-[#475569] text-sm text-center py-8">No spending data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
