import { Transaction, Analytics } from './types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

export async function generateExcelReport(
  transactions: Transaction[],
  analytics: Analytics
): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'FinSight';
  workbook.lastModifiedBy = 'FinSight';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ─── STYLES ─────────────────────────────────────────────────────────
  const headerFill: any = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A5F' },
  };
  const accentFill: any = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' },
  };
  const headerFont: any = { bold: true, color: { argb: 'FFE2E8F0' }, size: 11 };
  const titleFont: any = { bold: true, color: { argb: 'FF3B82F6' }, size: 14 };
  const border: any = {
    top: { style: 'thin', color: { argb: 'FF334155' } },
    left: { style: 'thin', color: { argb: 'FF334155' } },
    bottom: { style: 'thin', color: { argb: 'FF334155' } },
    right: { style: 'thin', color: { argb: 'FF334155' } },
  };

  // ─── SHEET 1: TRANSACTIONS ───────────────────────────────────────────
  const txnSheet = workbook.addWorksheet('Transactions', {
    views: [{ state: 'frozen', ySplit: 2 }],
  });

  txnSheet.mergeCells('A1:G1');
  const txnTitle = txnSheet.getCell('A1');
  txnTitle.value = '📊 FinSight — Transaction Log';
  txnTitle.font = titleFont;
  txnTitle.fill = accentFill;
  txnTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  txnSheet.getRow(1).height = 30;

  txnSheet.columns = [
    { key: 'date', width: 14 },
    { key: 'description', width: 50 },
    { key: 'payee', width: 25 },
    { key: 'category', width: 20 },
    { key: 'debit', width: 16 },
    { key: 'credit', width: 16 },
    { key: 'type', width: 12 },
  ];

  const txnHeaderRow = txnSheet.getRow(2);
  txnHeaderRow.values = ['Date', 'Description', 'Payee', 'Category', 'Debit (₹)', 'Credit (₹)', 'Type'];
  txnHeaderRow.eachCell(cell => {
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.border = border;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  txnHeaderRow.height = 22;

  transactions.forEach((t, i) => {
    const row = txnSheet.addRow({
      date: t.date,
      description: t.description,
      payee: t.payee,
      category: t.category,
      debit: t.debit || '',
      credit: t.credit || '',
      type: t.debit > 0 ? 'Debit' : 'Credit',
    });

    // Alternate row colors
    const fillColor = i % 2 === 0 ? 'FF1E293B' : 'FF0F172A';
    row.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      cell.font = { color: { argb: 'FFE2E8F0' }, size: 10 };
      cell.border = border;
      cell.alignment = { vertical: 'middle' };
    });

    // Color debit red, credit green
    const debitCell = row.getCell('debit');
    const creditCell = row.getCell('credit');
    if (t.debit > 0) debitCell.font = { color: { argb: 'FFEF4444' }, size: 10 };
    if (t.credit > 0) creditCell.font = { color: { argb: 'FF22C55E' }, size: 10 };
  });

  // ─── SHEET 2: MONTHLY SUMMARY ────────────────────────────────────────
  const monthSheet = workbook.addWorksheet('Monthly Summary');

  monthSheet.mergeCells('A1:E1');
  monthSheet.getCell('A1').value = '📅 Monthly Summary';
  monthSheet.getCell('A1').font = titleFont;
  monthSheet.getCell('A1').fill = accentFill;
  monthSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  monthSheet.getRow(1).height = 30;

  monthSheet.columns = [
    { key: 'month', width: 14 },
    { key: 'income', width: 18 },
    { key: 'expenses', width: 18 },
    { key: 'savings', width: 18 },
    { key: 'savingsRate', width: 16 },
  ];

  const mhRow = monthSheet.getRow(2);
  mhRow.values = ['Month', 'Income (₹)', 'Expenses (₹)', 'Savings (₹)', 'Savings %'];
  mhRow.eachCell(cell => {
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.border = border;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  mhRow.height = 22;

  analytics.monthlyData.forEach((m, i) => {
    const rate = m.income > 0 ? ((m.savings / m.income) * 100).toFixed(1) : '0';
    const row = monthSheet.addRow({
      month: m.month,
      income: m.income,
      expenses: m.expenses,
      savings: m.savings,
      savingsRate: `${rate}%`,
    });

    const fillColor = i % 2 === 0 ? 'FF1E293B' : 'FF0F172A';
    row.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      cell.font = { color: { argb: 'FFE2E8F0' }, size: 10 };
      cell.border = border;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    if (m.savings >= 0) {
      row.getCell('savings').font = { color: { argb: 'FF22C55E' }, size: 10 };
    } else {
      row.getCell('savings').font = { color: { argb: 'FFEF4444' }, size: 10 };
    }
  });

  // Totals row
  const totalRow = monthSheet.addRow({
    month: 'TOTAL',
    income: analytics.totalIncome,
    expenses: analytics.totalExpenses,
    savings: analytics.savings,
    savingsRate: `${analytics.savingsRate}%`,
  });
  totalRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFBBF24' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    cell.border = border;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // ─── SHEET 3: CATEGORY ANALYSIS ──────────────────────────────────────
  const catSheet = workbook.addWorksheet('Category Analysis');

  catSheet.mergeCells('A1:D1');
  catSheet.getCell('A1').value = '🏷️ Spending by Category';
  catSheet.getCell('A1').font = titleFont;
  catSheet.getCell('A1').fill = accentFill;
  catSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  catSheet.getRow(1).height = 30;

  catSheet.columns = [
    { key: 'category', width: 24 },
    { key: 'amount', width: 18 },
    { key: 'percentage', width: 14 },
    { key: 'txnCount', width: 16 },
  ];

  const chRow = catSheet.getRow(2);
  chRow.values = ['Category', 'Amount (₹)', '% of Expenses', 'Transactions'];
  chRow.eachCell(cell => {
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.border = border;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  chRow.height = 22;

  analytics.categorySpending.forEach((c, i) => {
    const txnCount = transactions.filter(t => t.category === c.category && t.debit > 0).length;
    const row = catSheet.addRow({
      category: c.category,
      amount: c.amount,
      percentage: `${c.percentage.toFixed(1)}%`,
      txnCount,
    });

    const fillColor = i % 2 === 0 ? 'FF1E293B' : 'FF0F172A';
    row.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      cell.font = { color: { argb: 'FFE2E8F0' }, size: 10 };
      cell.border = border;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });

  // ─── SHEET 4: FREQUENT PAYEES ────────────────────────────────────────
  const payeeSheet = workbook.addWorksheet('Frequent Payees');

  payeeSheet.mergeCells('A1:E1');
  payeeSheet.getCell('A1').value = '🔄 Frequent Payees & Recurring Payments';
  payeeSheet.getCell('A1').font = titleFont;
  payeeSheet.getCell('A1').fill = accentFill;
  payeeSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  payeeSheet.getRow(1).height = 30;

  payeeSheet.columns = [
    { key: 'payee', width: 28 },
    { key: 'category', width: 22 },
    { key: 'count', width: 14 },
    { key: 'total', width: 18 },
    { key: 'recurring', width: 14 },
  ];

  const phRow = payeeSheet.getRow(2);
  phRow.values = ['Payee', 'Category', 'Transactions', 'Total Spent (₹)', 'Recurring?'];
  phRow.eachCell(cell => {
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.border = border;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  phRow.height = 22;

  analytics.frequentPayees.forEach((p, i) => {
    const row = payeeSheet.addRow({
      payee: p.payee,
      category: p.category,
      count: p.count,
      total: p.total,
      recurring: p.isRecurring ? '✓ Yes' : 'No',
    });

    const fillColor = i % 2 === 0 ? 'FF1E293B' : 'FF0F172A';
    row.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      cell.font = { color: { argb: 'FFE2E8F0' }, size: 10 };
      cell.border = border;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    if (p.isRecurring) {
      row.getCell('recurring').font = { color: { argb: 'FF22C55E' }, bold: true, size: 10 };
    }
  });

  // ─── EXPORT ──────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FinSight-Report-${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
