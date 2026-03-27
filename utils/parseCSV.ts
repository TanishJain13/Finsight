import Papa from 'papaparse';
import { Transaction } from './types';
import { extractPayee } from './extractPayee';
import { categorizeTransaction } from './categorize';

// Common column name aliases to normalize
const COL_ALIASES: Record<string, string[]> = {
  date: ['date', 'transaction date', 'txn date', 'value date', 'posting date', 'trans date', 'dt'],
  description: ['description', 'narration', 'particulars', 'details', 'remarks', 'transaction details', 'transaction narration', 'tran particulars'],
  debit: ['debit', 'withdrawal', 'dr', 'debit amount', 'withdrawal amount', 'amount (dr)', 'dr amount', 'paid out'],
  credit: ['credit', 'deposit', 'cr', 'credit amount', 'deposit amount', 'amount (cr)', 'cr amount', 'paid in'],
  amount: ['amount', 'transaction amount', 'txn amount'],
};

function normalizeHeader(header: string): string {
  const lower = header.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(COL_ALIASES)) {
    if (aliases.some(alias => lower.includes(alias))) return canonical;
  }
  return lower;
}

function parseAmount(val: string | number | undefined): number {
  if (!val) return 0;
  const str = String(val).replace(/[₹,\s$€£]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.abs(num);
}

function parseDate(val: string): string {
  if (!val) return '';
  // Try native Date parse
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

  // Try DD/MM/YYYY and DD-MM-YYYY
  const match = val.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (match) {
    const [_, dd, mm, yyyy] = match;
    const year = yyyy.length === 2 ? `20${yyyy}` : yyyy;
    const d2 = new Date(`${year}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`);
    if (!isNaN(d2.getTime())) return d2.toISOString().split('T')[0];
  }

  return val;
}

let txnCounter = 0;

export async function parseCSV(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          if (!result.data || result.data.length === 0) {
            reject(new Error('CSV is empty or could not be parsed.'));
            return;
          }

          // Normalize headers
          const rawHeaders = Object.keys(result.data[0] as object);
          const headerMap: Record<string, string> = {};
          rawHeaders.forEach(h => {
            headerMap[h] = normalizeHeader(h);
          });

          const transactions: Transaction[] = [];

          (result.data as Record<string, string>[]).forEach((row) => {
            // Remap row keys to normalized keys
            const norm: Record<string, string> = {};
            rawHeaders.forEach(h => { norm[headerMap[h]] = row[h]; });

            const description = norm.description || Object.values(row).find(v => v && v.length > 5) || '';
            if (!description) return;

            let debit = 0;
            let credit = 0;

            if (norm.debit !== undefined || norm.credit !== undefined) {
              debit = parseAmount(norm.debit);
              credit = parseAmount(norm.credit);
            } else if (norm.amount !== undefined) {
              // Some CSVs use a single amount column with +/- sign
              const raw = String(norm.amount || '').replace(/[₹,\s$€£]/g, '').trim();
              const num = parseFloat(raw);
              if (!isNaN(num)) {
                if (num < 0) debit = Math.abs(num);
                else credit = num;
              }
            }

            const payee = extractPayee(description);
            const category = categorizeTransaction(payee, description);
            const date = parseDate(norm.date || '');

            transactions.push({
              id: `txn-${++txnCounter}-${Math.random().toString(36).slice(2,7)}`,
              date,
              description,
              debit,
              credit,
              payee,
              category,
            });
          });

          if (transactions.length === 0) {
            reject(new Error('No valid transactions found. Please check CSV format.'));
          } else {
            resolve(transactions);
          }
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(new Error(`CSV parse error: ${err.message}`)),
    });
  });
}
