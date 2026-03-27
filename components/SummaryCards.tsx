'use client';
import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react';
import { Analytics } from '@/utils/types';

interface SummaryCardsProps {
  analytics: Analytics;
}

function formatINR(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 10_00_000) return `₹${(amount / 10_00_000).toFixed(2)}L`;
  if (abs >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

const cards = (a: Analytics) => [
  {
    title: 'Total Income',
    value: formatINR(a.totalIncome),
    rawValue: a.totalIncome,
    sub: `Avg ${formatINR(a.avgMonthlyIncome)}/mo`,
    icon: TrendingUp,
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.1)',
    borderColor: 'rgba(34,197,94,0.2)',
    positive: true,
  },
  {
    title: 'Total Expenses',
    value: formatINR(a.totalExpenses),
    rawValue: a.totalExpenses,
    sub: `Avg ${formatINR(a.avgMonthlyExpense)}/mo`,
    icon: TrendingDown,
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.2)',
    positive: false,
  },
  {
    title: 'Net Savings',
    value: formatINR(a.savings),
    rawValue: a.savings,
    sub: `${a.savingsRate}% savings rate`,
    icon: PiggyBank,
    color: a.savings >= 0 ? '#3b82f6' : '#f97316',
    bgColor: a.savings >= 0 ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)',
    borderColor: a.savings >= 0 ? 'rgba(59,130,246,0.2)' : 'rgba(249,115,22,0.2)',
    positive: a.savings >= 0,
  },
  {
    title: 'Savings Rate',
    value: `${a.savingsRate}%`,
    rawValue: a.savingsRate,
    sub: a.savingsRate >= 20 ? '💪 Great discipline!' : a.savingsRate >= 10 ? '👍 Keep improving' : '⚠️ Consider saving more',
    icon: Percent,
    color: a.savingsRate >= 20 ? '#22c55e' : a.savingsRate >= 10 ? '#eab308' : '#ef4444',
    bgColor: a.savingsRate >= 20 ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
    borderColor: a.savingsRate >= 20 ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)',
    positive: a.savingsRate >= 10,
  },
];

export default function SummaryCards({ analytics }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards(analytics).map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-slide-up"
            style={{
              background: card.bgColor,
              borderColor: card.borderColor,
              animationDelay: `${i * 0.08}s`,
              animationFillMode: 'both',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${card.color}20` }}
              >
                <Icon size={18} style={{ color: card.color }} />
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  background: `${card.color}15`,
                  color: card.color,
                }}
              >
                {card.positive ? '▲' : '▼'}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-[#64748b] text-xs uppercase tracking-wider">{card.title}</p>
              <p
                className="text-2xl font-bold num"
                style={{ color: card.color, fontFamily: 'JetBrains Mono, monospace' }}
              >
                {card.value}
              </p>
              <p className="text-[#64748b] text-xs">{card.sub}</p>
            </div>

            {/* Progress indicator */}
            {card.title === 'Savings Rate' && (
              <div className="mt-3">
                <div className="h-1.5 bg-[#334155] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(analytics.savingsRate, 100)}%`,
                      background: card.color,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
