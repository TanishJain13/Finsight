# FinSight 💰

> Privacy-first financial analytics — understand your money in seconds.

## Features

- **Upload CSV or PDF** bank statements via drag-and-drop
- **Automatic categorization** — Food, Transport, Shopping, Entertainment, and more
- **Smart payee extraction** — converts messy bank descriptions into readable names
- **Interactive charts** — monthly cash flow, category breakdown, savings trend
- **Transaction table** — searchable, filterable, sortable
- **Frequent payees & recurring detection** — see who you pay most often
- **Excel export** — 4-sheet professional report
- **100% private** — all processing happens in your browser, zero data sent to servers

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing

A sample bank statement CSV is included at `public/sample-statement.csv`.  
You can also click **"View Demo"** on the landing page to see the app with generated data.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** — charts
- **Papaparse** — CSV parsing
- **pdfjs-dist** — PDF text extraction
- **ExcelJS** — Excel export

## Project Structure

```
app/
  page.tsx              # Landing page
  dashboard/page.tsx    # Analytics dashboard

components/
  UploadBox.tsx          # Drag-and-drop file upload
  SummaryCards.tsx       # Income/Expense/Savings cards
  Charts.tsx             # Recharts visualizations
  TransactionTable.tsx   # Sortable, searchable table
  FrequentPayees.tsx     # Payee & merchant analysis
  ExportButton.tsx       # Excel download trigger

utils/
  types.ts               # TypeScript interfaces
  parseCSV.ts            # Papaparse CSV parser
  parsePDF.ts            # PDF text extraction + parsing
  extractPayee.ts        # Merchant name normalization
  categorize.ts          # Transaction categorization
  analyzeTransactions.ts # Analytics engine
  generateExcelReport.ts # ExcelJS report generator
```

## Privacy

FinSight has **no backend**. Your bank statement data:
- Is never uploaded to any server
- Is never stored in any database
- Is processed entirely in browser memory
- Is cleared when you close the tab

## License

MIT
