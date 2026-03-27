import { Transaction } from './types';
import { extractPayee } from './extractPayee';
import { categorizeTransaction } from './categorize';

let txnCounter = 0;

// Patterns to detect transaction lines in PDF text
const DATE_PATTERNS = [
  /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/g,
  /\b(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/g,
  /\b(\d{1,2}[\s\-\/](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^0-9\s]?[\s\-\/]\d{2,4})\b/gi,
  /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^0-9\s]?[\s\-\/]\d{1,2}[\s\-\/]\d{2,4})\b/gi,
];

const AMOUNT_PATTERN = /(?:\d{1,3}(?:,\d{3})*|\d+)\.\d{2}/g;

function parseDate(val: string): string {
  // Normalize separators and try standard parsing
  const normalized = val.replace(/[\.\-]/g, '/');
  const d = new Date(normalized);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

  const match = val.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (match) {
    const [_, dd, mm, yyyy] = match;
    const year = yyyy.length === 2 ? `20${yyyy}` : yyyy;
    const d2 = new Date(`${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`);
    if (!isNaN(d2.getTime())) return d2.toISOString().split('T')[0];
  }
  return val;
}

function parseAmount(str: string): number {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

/**
 * Extract text from PDF using pdfjs-dist loaded via CDN in the browser
 */
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Load pdfjs-dist dynamically to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(pageText);
  }

  const fullText = textParts.join('\n');
  console.log('[PDF Debug] Extracted Text:', fullText);
  return fullText;
}

/**
 * Parse extracted PDF text into transactions using heuristics
 */
function parseTransactionsFromText(text: string): Transaction[] {
  const transactions: Transaction[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Look for lines that contain a date and amounts
    const amounts = line.match(AMOUNT_PATTERN);
    if (!amounts || amounts.length < 1) continue;

    let date = '';
    for (const pattern of DATE_PATTERNS) {
      pattern.lastIndex = 0;
      const m = pattern.exec(line);
      if (m) { date = parseDate(m[1]); break; }
    }
    if (!date) continue;

    // Extract description: everything between date and first amount
    const firstAmount = line.indexOf(amounts[0]);
    const dateEnd = line.search(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/) + 10;
    let description = line.slice(dateEnd, firstAmount).trim();
    if (!description) description = line.slice(0, 40).trim();

    // Determine debit/credit heuristically
    let debit = 0;
    let credit = 0;

    if (amounts.length >= 2) {
      const a1 = parseAmount(amounts[amounts.length - 2]);
      const a2 = parseAmount(amounts[amounts.length - 1]);
      // In many bank statements, last column is balance; second-to-last is transaction amount
      const txnAmount = a1;
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('cr') || lowerLine.includes('credit') || lowerLine.includes('deposit')) {
        credit = txnAmount;
      } else {
        debit = txnAmount;
      }
    } else {
      debit = parseAmount(amounts[0]);
    }

    if (debit === 0 && credit === 0) continue;

    const payee = extractPayee(description);
    const category = categorizeTransaction(payee, description);

    transactions.push({
      id: `pdf-${++txnCounter}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      description,
      debit,
      credit,
      payee,
      category,
    });
  }

  return transactions;
}

export async function parsePDF(file: File): Promise<Transaction[]> {
  const text = await extractTextFromPDF(file);
  const transactions = parseTransactionsFromText(text);

  if (transactions.length === 0) {
    throw new Error(
      'Could not extract transactions from this PDF. ' +
      'For best results, please use a CSV export from your bank.'
    );
  }

  return transactions;
}
