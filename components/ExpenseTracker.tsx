import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, TrendingUp, RefreshCw, Calculator } from 'lucide-react';
import { ExpenseItem } from '../types';

interface ExpenseTrackerProps {
  expenses: ExpenseItem[];
  onUpdateExpenses: (items: ExpenseItem[]) => void;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses, onUpdateExpenses }) => {
  const [title, setTitle] = useState('');
  const [krwAmount, setKrwAmount] = useState('');
  const [rate, setRate] = useState<number>(0.024); // Default fallback
  const [loadingRate, setLoadingRate] = useState(false);

  useEffect(() => {
    const fetchRate = async () => {
      setLoadingRate(true);
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
        const data = await res.json();
        if (data && data.rates && data.rates.TWD) {
          setRate(data.rates.TWD);
        }
      } catch (e) {
        console.error("Rate fetch failed", e);
      } finally {
        setLoadingRate(false);
      }
    };
    fetchRate();
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !krwAmount) return;

    const krw = parseFloat(krwAmount);
    const twd = Math.round(krw * rate);

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      title,
      amountKRW: krw,
      amountTWD: twd,
      date: new Date().toISOString(),
      category: 'general'
    };

    onUpdateExpenses([newItem, ...expenses]);
    setTitle('');
    setKrwAmount('');
  };

  const handleDelete = (id: string) => {
    onUpdateExpenses(expenses.filter(i => i.id !== id));
  };

  const totalKRW = expenses.reduce((sum, item) => sum + item.amountKRW, 0);
  const totalTWD = expenses.reduce((sum, item) => sum + item.amountTWD, 0);

  return (
    <div className="px-6 py-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">記帳助手</h2>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
          <span>1 KRW ≈ {rate.toFixed(4)} TWD</span>
          {loadingRate ? <RefreshCw size={10} className="animate-spin" /> : null}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[24px] p-6 text-white shadow-xl shadow-slate-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">總支出 (約台幣)</p>
          <div className="text-3xl font-black mb-4">NT$ {totalTWD.toLocaleString()}</div>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-xl w-fit">
            <span className="text-xs">₩</span>
            <span>{totalKRW.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="品項名稱 (如: 晚餐、伴手禮)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
          />
          <div className="flex gap-3">
             <div className="relative flex-1">
                <span className="absolute left-4 top-3.5 text-slate-400 text-xs font-bold">₩</span>
                <input 
                  type="number" 
                  value={krwAmount}
                  onChange={e => setKrwAmount(e.target.value)}
                  placeholder="韓元金額"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                />
             </div>
             <button 
               type="submit" 
               disabled={!title || !krwAmount}
               className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Plus size={24} />
             </button>
          </div>
          {krwAmount && (
             <div className="text-right text-xs font-bold text-emerald-600">
                ≈ NT$ {Math.round(parseFloat(krwAmount) * rate).toLocaleString()}
             </div>
          )}
        </div>
      </form>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-24">
        {expenses.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-10 opacity-50">
             <Wallet size={48} className="text-slate-300 mb-2" />
             <p className="text-slate-400 font-bold text-sm">還沒有記帳紀錄</p>
           </div>
        ) : (
          expenses.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between group">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <TrendingUp size={18} />
                 </div>
                 <div>
                   <div className="font-bold text-slate-800 text-sm">{item.title}</div>
                   <div className="text-[10px] text-slate-400 font-medium">₩ {item.amountKRW.toLocaleString()}</div>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="text-right">
                    <div className="font-black text-slate-800 text-sm">NT$ {item.amountTWD.toLocaleString()}</div>
                 </div>
                 <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                   <Trash2 size={16} />
                 </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;