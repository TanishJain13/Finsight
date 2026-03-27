'use client';
import { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { Transaction, Analytics } from '@/utils/types';

interface ExportButtonProps {
  transactions: Transaction[];
  analytics: Analytics;
}

type ExportState = 'idle' | 'generating' | 'done' | 'error';

export default function ExportButton({ transactions, analytics }: ExportButtonProps) {
  const [state, setState] = useState<ExportState>('idle');

  const handleExport = async () => {
    if (state === 'generating') return;
    setState('generating');

    try {
      const { generateExcelReport } = await import('@/utils/generateExcelReport');
      await generateExcelReport(transactions, analytics);
      setState('done');
      setTimeout(() => setState('idle'), 3000);
    } catch (err) {
      console.error(err);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={state === 'generating'}
      className={`
        group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm
        transition-all duration-200 select-none
        ${state === 'done'
          ? 'bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#22c55e]'
          : state === 'error'
          ? 'bg-red-500/15 border border-red-500/40 text-red-400'
          : state === 'generating'
          ? 'bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] cursor-wait'
          : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white border border-[#3b82f6] hover:shadow-glow-blue'
        }
      `}
    >
      {state === 'generating' ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          <span>Generating...</span>
        </>
      ) : state === 'done' ? (
        <>
          <CheckCircle size={15} />
          <span>Downloaded!</span>
        </>
      ) : state === 'error' ? (
        <>
          <span>⚠ Failed — Retry</span>
        </>
      ) : (
        <>
          <Download size={15} className="group-hover:translate-y-0.5 transition-transform" />
          <span>Download Excel Report</span>
        </>
      )}
    </button>
  );
}
