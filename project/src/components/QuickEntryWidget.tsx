import React from 'react';
import { Plus, ArrowDown, ArrowUp, ArrowLeftRight } from 'lucide-react';

interface QuickEntryWidgetProps {
  onIncomeClick: () => void;
  onExpenseClick: () => void;
  onTransferClick: () => void;
}

const QuickEntryWidget: React.FC<QuickEntryWidgetProps> = ({
  onIncomeClick,
  onExpenseClick,
  onTransferClick,
}) => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          onClick={onIncomeClick}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Add Income"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <button
          onClick={onExpenseClick}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Add Expense"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <button
          onClick={onTransferClick}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Add Transfer"
        >
          <ArrowLeftRight className="w-6 h-6" />
        </button>
      </div>
      <button
        className="bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Quick Actions"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default QuickEntryWidget; 