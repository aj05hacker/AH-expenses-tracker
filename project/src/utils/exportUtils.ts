import { Transaction } from '../db/db';

// Function to export transactions as CSV
export function exportAsCSV(transactions: Transaction[], getCategoryName: (id: number) => string) {
  if (!transactions || transactions.length === 0) {
    throw new Error('No transactions to export');
  }
  
  // Generate CSV content
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes'];
  
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      const type = t.type.charAt(0).toUpperCase() + t.type.slice(1);
      const category = getCategoryName(t.categoryId);
      const amount = t.amount.toFixed(2);
      const notes = t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '';
      
      return [date, type, category, amount, notes].join(',');
    })
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}