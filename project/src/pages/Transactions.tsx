import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Transaction, Category } from '../db/db';
import { Edit, Trash, Filter, X, Search } from 'lucide-react';
import TransactionEditModal from '../components/TransactionEditModal';

const Transactions: React.FC = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Get all transactions, sorted by date (newest first)
  const transactions = useLiveQuery(
    () => db.transactions.orderBy('date').reverse().toArray()
  );
  
  // Get all categories
  const categories = useLiveQuery(() => db.categories.toArray());
  
  // Apply filters to transactions
  const filteredTransactions = transactions?.filter(transaction => {
    // Filter by type
    if (filterType !== 'all' && transaction.type !== filterType) {
      return false;
    }
    
    // Filter by category
    if (filterCategory && transaction.categoryId !== filterCategory) {
      return false;
    }
    
    // Filter by date range
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      if (transaction.date < fromDate) {
        return false;
      }
    }
    
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999);
      if (transaction.date > toDate) {
        return false;
      }
    }
    
    // Filter by search term (in notes)
    if (searchTerm && !transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };
  
  // Handle delete transaction
  const handleDelete = async (id?: number) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await db.transactions.delete(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory(null);
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchTerm('');
  };
  
  // Export transactions as CSV
  const exportAsCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      alert('No transactions to export');
      return;
    }
    
    // Generate CSV content
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes'];
    
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => {
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
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="btn btn-outline flex items-center gap-1"
          >
            <Filter className="w-4 h-4" /> 
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button 
            onClick={exportAsCSV} 
            className="btn btn-secondary"
          >
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="card animate-slide-up mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Filters</h2>
            <button 
              onClick={clearFilters}
              className="text-text-secondary hover:text-text-primary flex items-center gap-1 text-sm"
            >
              <X className="w-4 h-4" /> Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type filter */}
            <div>
              <label className="label">Transaction Type</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                className="input"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            {/* Category filter */}
            <div>
              <label className="label">Category</label>
              <select 
                value={filterCategory || ''}
                onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : null)}
                className="input"
              >
                <option value="">All Categories</option>
                {categories?.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Search by notes */}
            <div>
              <label className="label">Search Notes</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-9"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              </div>
            </div>
            
            {/* Date range filter */}
            <div>
              <label className="label">From Date</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="input"
              />
            </div>
            
            <div>
              <label className="label">To Date</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Transactions list */}
      <div className="mb-4">
        {filteredTransactions && filteredTransactions.length > 0 ? (
          <div className="card mb-4 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-text-secondary/10">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Notes</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(transaction => (
                  <tr 
                    key={transaction.id} 
                    className="border-b border-text-secondary/10 hover:bg-background/50"
                  >
                    <td className="py-3 px-4">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${transaction.type === 'income' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getCategoryName(transaction.categoryId)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      <span className={transaction.type === 'income' ? 'text-success' : 'text-error'}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {transaction.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingTransaction(transaction)}
                          className="p-1 text-text-secondary hover:text-primary"
                          aria-label="Edit transaction"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(transaction.id)}
                          className="p-1 text-text-secondary hover:text-error"
                          aria-label="Delete transaction"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card py-8 flex flex-col items-center justify-center text-text-secondary">
            <p className="mb-2">No transactions found</p>
            {showFilters && <button onClick={clearFilters} className="text-primary underline">Clear filters</button>}
          </div>
        )}
      </div>
      
      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <TransactionEditModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          categories={categories || []}
        />
      )}
    </div>
  );
};

export default Transactions;