'use client';
import { useCallback, useState, useRef } from 'react';
import { Upload, FileText, Shield, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { parseCSV } from '@/utils/parseCSV';
import { parsePDF } from '@/utils/parsePDF';
import { Transaction } from '@/utils/types';

interface UploadBoxProps {
  onTransactions: (txns: Transaction[]) => void;
}

type UploadState = 'idle' | 'dragging' | 'parsing' | 'success' | 'error';

export default function UploadBox({ onTransactions }: UploadBoxProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setState('parsing');
    setError('');
    setProgress('Reading file...');

    try {
      let transactions: Transaction[] = [];

      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setProgress('Parsing CSV transactions...');
        transactions = await parseCSV(file);
      } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
        setProgress('Loading PDF parser...');
        transactions = await parsePDF(file);
      } else {
        throw new Error('Unsupported file type. Please upload a CSV or PDF file.');
      }

      setProgress(`Found ${transactions.length} transactions!`);
      setState('success');
      setTimeout(() => onTransactions(transactions), 600);
    } catch (err: any) {
      setState('error');
      setError(err.message || 'Failed to parse file. Please check format.');
    }
  }, [onTransactions]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState('idle');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setState('dragging');
  };
  const handleDragLeave = () => setState('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload zone */}
      <div
        onClick={() => state === 'idle' || state === 'error' ? fileRef.current?.click() : null}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${state === 'dragging'
            ? 'border-[#3b82f6] bg-[#3b82f6]/8 shadow-glow-blue scale-[1.02]'
            : state === 'success'
            ? 'border-[#22c55e] bg-[#22c55e]/5 cursor-default'
            : state === 'error'
            ? 'border-red-500/60 bg-red-500/5'
            : 'border-[#334155] bg-[#1e293b]/50 hover:border-[#3b82f6]/60 hover:bg-[#1e293b]/80'
          }
          p-12 flex flex-col items-center gap-6 select-none
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Icon */}
        <div className={`
          w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
          ${state === 'dragging' ? 'bg-[#3b82f6]/20 scale-110' :
            state === 'success' ? 'bg-[#22c55e]/20' :
            state === 'error' ? 'bg-red-500/20' :
            state === 'parsing' ? 'bg-[#3b82f6]/10' :
            'bg-[#334155]/50'}
        `}>
          {state === 'parsing' ? (
            <Loader2 size={36} className="text-[#3b82f6] animate-spin" />
          ) : state === 'success' ? (
            <CheckCircle size={36} className="text-[#22c55e]" />
          ) : state === 'error' ? (
            <AlertCircle size={36} className="text-red-400" />
          ) : (
            <Upload size={36} className={state === 'dragging' ? 'text-[#3b82f6]' : 'text-[#64748b]'} />
          )}
        </div>

        {/* Text content */}
        <div className="text-center space-y-2">
          {state === 'idle' && (
            <>
              <p className="text-white font-semibold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                Drop your bank statement here
              </p>
              <p className="text-[#64748b] text-sm">
                or <span className="text-[#3b82f6] underline underline-offset-2">click to browse</span>
              </p>
            </>
          )}
          {state === 'dragging' && (
            <p className="text-[#3b82f6] font-semibold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
              Release to upload
            </p>
          )}
          {state === 'parsing' && (
            <>
              <p className="text-white font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
                {fileName}
              </p>
              <p className="text-[#3b82f6] text-sm animate-pulse">{progress}</p>
            </>
          )}
          {state === 'success' && (
            <>
              <p className="text-[#22c55e] font-semibold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                Parsed successfully!
              </p>
              <p className="text-[#64748b] text-sm">{progress}</p>
            </>
          )}
          {state === 'error' && (
            <>
              <p className="text-red-400 font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
                Failed to parse file
              </p>
              <p className="text-[#64748b] text-sm max-w-sm">{error}</p>
              <button
                onClick={(e) => { e.stopPropagation(); setState('idle'); setError(''); }}
                className="mt-2 text-sm text-[#3b82f6] hover:underline"
              >
                Try again
              </button>
            </>
          )}
        </div>

        {/* Supported formats */}
        {(state === 'idle' || state === 'dragging') && (
          <div className="flex gap-3">
            {['CSV', 'PDF'].map(type => (
              <span key={type} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#334155]/50 rounded-lg text-xs text-[#94a3b8]">
                <FileText size={12} />
                {type}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Privacy badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[#64748b] text-xs">
        <Shield size={13} className="text-[#22c55e]" />
        <span>Your bank statement is processed <span className="text-[#22c55e]">locally in your browser</span> and never stored or sent anywhere.</span>
      </div>
    </div>
  );
}
