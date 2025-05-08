import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db, Category } from '../db/db';
import { ArrowLeft, Check } from 'lucide-react';

const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  
  // Get all categories
  const categories = useLiveQuery(() => db.categories.toArray());
  
  // Transaction form state
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    categoryId: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Set initial category based on transaction type
  useEffect(() => {
    if (categories && categories.length > 0) {
      const firstMatchingCategory = categories.find(c => c.type === formData.type);
      if (firstMatchingCategory && firstMatchingCategory.id) {
        setFormData(prev => ({
          ...prev,
          categoryId: firstMatchingCategory.id!,
        }));
      }
    }
  }, [categories, formData.type]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await db.transactions.add({
        amount: Number(formData.amount),
        type: formData.type,
        categoryId: Number(formData.categoryId),
        date: new Date(formData.date),
        notes: formData.notes,
        createdAt: new Date(),
      });
      
      // Redirect to transactions page
      navigate('/transactions');
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };
  
  // Filter categories based on transaction type
  const filteredCategories = categories?.filter(
    category => category.type === formData.type
  ) || [];
  
  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full hover:bg-background"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Add Transaction</h1>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Transaction Type */}
          <div className="mb-6">
            <label className="label">Transaction Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`py-3 rounded-lg text-center font-medium transition-colors ${
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
                className={`py-3 rounded-lg text-center font-medium transition-colors ${
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
          <div className="mb-6">
            <label htmlFor="amount" className="label">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="input pl-8 text-lg"
              />
            </div>
          </div>
          
          {/* Category */}
          <div className="mb-6">
            <label htmlFor="categoryId" className="label">Category</label>
            {filteredCategories.length > 0 ? (
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
            ) : (
              <div className="text-text-secondary text-sm mt-1">
                No categories found. Please add categories first.
              </div>
            )}
          </div>
          
          {/* Date */}
          <div className="mb-6">
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
              className="input min-h-[100px]"
              placeholder="Add notes about this transaction..."
            />
          </div>
          
          {/* Submit button */}
          <button 
            type="submit" 
            className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
            disabled={!formData.amount || !formData.categoryId}
          >
            <Check className="w-5 h-5" /> Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;