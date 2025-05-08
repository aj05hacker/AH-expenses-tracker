import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { db, Transaction, Category } from '../db/db';

interface TransactionEditModalProps {
  transaction: Transaction;
  onClose: () => void;
  categories: Category[];
}

const TransactionEditModal: React.FC<TransactionEditModalProps> = ({ transaction, onClose, categories }) => {
  // State to hold form data
  const [formData, setFormData] = useState({
    amount: transaction.amount,
    type: transaction.type,
    categoryId: transaction.categoryId,
    date: new Date(transaction.date).toISOString().split('T')[0],
    notes: transaction.notes || '',
  });
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) : value,
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await db.transactions.update(transaction.id!, {
        ...formData,
        amount: Number(formData.amount),
        date: new Date(formData.date),
        categoryId: Number(formData.categoryId),
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };
  
  // Filter categories based on transaction type
  const filteredCategories = categories.filter(
    category => category.type === formData.type
  );
  
  // Handle type change
  useEffect(() => {
    // If transaction type changes, reset category to first available
    const firstMatchingCategory = categories.find(c => c.type === formData.type);
    if (firstMatchingCategory && firstMatchingCategory.id) {
      setFormData(prev => ({
        ...prev,
        categoryId: firstMatchingCategory.id!,
      }));
    }
  }, [formData.type, categories]);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-4 border-b border-text-secondary/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit Transaction</h2>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Transaction Type */}
          <div className="mb-4">
            <label className="label">Transaction Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`py-2 rounded-lg text-center transition-colors ${
                  formData.type === 'income' 
                    ? 'bg-success text-white' 
                    : 'bg-background text-text-secondary'
                }`}
                onClick={() => setFormData({ ...formData, type: 'income' })}
              >
                Income
              </button>
              <button
                type="button"
                className={`py-2 rounded-lg text-center transition-colors ${
                  formData.type === 'expense' 
                    ? 'bg-error text-white' 
                    : 'bg-background text-text-secondary'
                }`}
                onClick={() => setFormData({ ...formData, type: 'expense' })}
              >
                Expense
              </button>
            </div>
          </div>
          
          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="label">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              className="input"
            />
          </div>
          
          {/* Category */}
          <div className="mb-4">
            <label htmlFor="categoryId" className="label">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="input"
            >
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date */}
          <div className="mb-4">
            <label htmlFor="date" className="label">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          
          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="label">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input min-h-[80px]"
              placeholder="Add notes..."
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionEditModal;