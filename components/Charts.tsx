'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
  TooltipProps,
} from 'recharts';
import { Analytics } from '@/utils/types';

interface ChartsProps {
  analytics: Analytics;
}

function formatK(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

// Custom tooltip styling
const customTooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#f8fafc',
  fontSize: '13px',
};

function CustomBarTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload) return null;
  return (
    <div style={customTooltipStyle}>
      <p className="text-[#94a3b8] text-xs mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#94a3b8]">{p.name}:</span>
          <span className="font-mono font-semibold" style={{ color: p.color }}>{formatK(p.value as number)}</span>
        </div>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0];
  return (
    <div style={customTooltipStyle}>
      <p style={{ color: d.payload.color }} className="font-medium">{d.name}</p>
      <p className="font-mono text-white">₹{(d.value as number).toLocaleString('en-IN')}</p>
      <p className="text-[#64748b] text-xs">{d.payload.percentage?.toFixed(1)}% of expenses</p>
    </div>
  );
}

function CustomLineTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload) return null;
  return (
    <div style={customTooltipStyle}>
      <p className="text-[#94a3b8] text-xs mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#94a3b8]">{p.name}:</span>
          <span className="font-mono font-semibold" style={{ color: p.color }}>{formatK(p.value as number)}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
      <div className="mb-5">
        <h3 className="text-white font-semibold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h3>
        {subtitle && <p className="text-[#64748b] text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// Custom legend for pie chart
function PieLegend({ data }: { data: Analytics['categorySpending'] }) {
  return (
    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
      {data.slice(0, 8).map((item) => (
        <div key={item.category} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="text-[#94a3b8] text-xs truncate max-w-[120px]">{item.category}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#64748b] text-xs">{item.percentage.toFixed(0)}%</span>
            <span className="text-white text-xs font-mono">₹{(item.amount / 1000).toFixed(0)}K</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Charts({ analytics }: ChartsProps) {
  const { monthlyData, categorySpending } = analytics;

  if (monthlyData.length === 0 && categorySpending.length === 0) {
    return <div className="text-[#64748b] text-center py-10">No chart data available.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Monthly Bar Chart — 2 cols */}
      {monthlyData.length > 0 && (
        <div className="lg:col-span-2">
          <ChartCard title="Monthly Cash Flow" subtitle="Income vs expenses over time">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} barGap={2} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatK}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                <Legend
                  wrapperStyle={{ paddingTop: 16, fontSize: 12, color: '#64748b' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Category Pie Chart — 1 col */}
      {categorySpending.length > 0 && (
        <div className="lg:col-span-1">
          <ChartCard title="Spending Breakdown" subtitle="By category">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categorySpending.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="category"
                  strokeWidth={0}
                >
                  {categorySpending.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={categorySpending} />
          </ChartCard>
        </div>
      )}

      {/* Savings Trend Line Chart — full width */}
      {monthlyData.length > 1 && (
        <div className="lg:col-span-3">
          <ChartCard title="Savings Trend" subtitle="Net savings over time">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="savingsGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatK}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 12, fontSize: 12, color: '#64748b' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#savingsGreen)"
                  dot={{ fill: '#22c55e', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#savingsGradient)"
                  dot={{ fill: '#3b82f6', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  name="Savings"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ fill: '#a855f7', r: 3 }}
                  activeDot={{ r: 5 }}
                  strokeDasharray="4 2"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
