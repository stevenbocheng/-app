import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { Plus, Trash2, Check, ShoppingBag, Luggage } from 'lucide-react';

interface ChecklistViewProps {
  luggage: ChecklistItem[];
  shopping: ChecklistItem[];
  onUpdateLuggage: (items: ChecklistItem[]) => void;
  onUpdateShopping: (items: ChecklistItem[]) => void;
}

const ChecklistView: React.FC<ChecklistViewProps> = ({ luggage, shopping, onUpdateLuggage, onUpdateShopping }) => {
  const [activeTab, setActiveTab] = useState<'luggage' | 'shopping'>('luggage');
  const [newItemText, setNewItemText] = useState('');

  const currentList = activeTab === 'luggage' ? luggage : shopping;
  const updateCurrentList = activeTab === 'luggage' ? onUpdateLuggage : onUpdateShopping;

  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      isChecked: false,
      category: activeTab
    };
    updateCurrentList([...currentList, newItem]);
    setNewItemText('');
  };

  const toggleItem = (id: string) => {
    const newList = currentList.map(item =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    updateCurrentList(newList);
  };

  const deleteItem = (id: string) => {
    const newList = currentList.filter(item => item.id !== id);
    updateCurrentList(newList);
  };

  const checkedCount = currentList.filter(i => i.isChecked).length;
  const progress = currentList.length > 0 ? (checkedCount / currentList.length) * 100 : 0;

  return (
    <div className="px-6 py-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">旅行清單</h2>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('luggage')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'luggage' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Luggage size={16} />
          行李準備
        </button>
        <button
          onClick={() => setActiveTab('shopping')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'shopping' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <ShoppingBag size={16} />
          購物清單
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
          <span>完成進度</span>
          <span>{checkedCount} / {currentList.length}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${activeTab === 'luggage' ? 'bg-blue-500' : 'bg-pink-500'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleAddItem} className="relative mb-6">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder={activeTab === 'luggage' ? "新增行李項目..." : "新增購物項目..."}
          className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-700 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!newItemText}
          className={`absolute right-2 top-2 p-1.5 rounded-xl transition-colors ${newItemText ? (activeTab === 'luggage' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white') : 'bg-slate-100 text-slate-300'}`}
        >
          <Plus size={20} />
        </button>
      </form>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-20">
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            {activeTab === 'luggage' ? <Luggage size={48} className="text-slate-300 mb-2" /> : <ShoppingBag size={48} className="text-slate-300 mb-2" />}
            <p className="text-slate-400 font-bold text-sm">目前沒有項目</p>
          </div>
        ) : (
          currentList.map(item => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer group ${item.isChecked ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm hover:border-blue-200'}`}
            >
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${item.isChecked ? 'bg-slate-300 border-slate-300 text-white' : (activeTab === 'luggage' ? 'border-blue-200 text-transparent' : 'border-pink-200 text-transparent')}`}>
                <Check size={14} strokeWidth={4} />
              </div>
              <span className={`flex-1 font-bold text-sm ${item.isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {item.text}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                className="text-slate-300 hover:text-red-400 p-2 -mr-2 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChecklistView;