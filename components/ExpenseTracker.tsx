import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, TrendingUp, RefreshCw, Calendar, ChevronDown } from 'lucide-react';
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
  const [selectedDate, setSelectedDate] = useState<string>('all');

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

  // Get unique dates (YYYY-MM-DD)
  const uniqueDates = Array.from(new Set(expenses.map(item => item.date.split('T')[0]))).sort().reverse();

  // Filter expenses
  const filteredExpenses = selectedDate === 'all' 
    ? expenses 
    : expenses.filter(item => item.date.startsWith(selectedDate));

  const totalKRW = filteredExpenses.reduce((sum, item) => sum + item.amountKRW, 0);
  const totalTWD = filteredExpenses.reduce((sum, item) => sum + item.amountTWD, 0);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="px-6 py-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-black text-slate-800">記帳助手</h2>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
          <span>1 KRW ≈ {rate.toFixed(4)} TWD</span>
          {loadingRate ? <RefreshCw size={10} className="animate-spin" /> : null}
        </div>
      </div>

      {/* Summary Card - Fixed height and shrink prevention */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[24px] p-6 text-white shadow-xl shadow-slate-200 mb-6 relative overflow-hidden group flex-shrink-0 min-h-[160px] flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-colors duration-500"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full -ml-8 -mb-8 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col flex-1 justify-between">
          {/* Header Row */}
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Wallet size={14} className="text-blue-200" />
                </div>
                <span className="text-slate-300 text-xs font-bold tracking-wider">
                  {selectedDate === 'all' ? '總旅費支出' : '單日支出'}
                </span>
             </div>

             {/* Custom Dropdown */}
             <div className="relative">
                <div className="flex items-center gap-2 bg-slate-950/30 hover:bg-slate-950/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 transition-all">
                   <Calendar size={12} className="text-blue-400" />
                   <span className="text-xs font-bold text-white min-w-[3rem] text-center whitespace-nowrap">
                      {selectedDate === 'all' ? '全部' : formatDate(selectedDate)}
                   </span>
                   <ChevronDown size={12} className="text-slate-500" />
                </div>
                <select 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                >
                  <option value="all" className="text-slate-900 bg-white">顯示全部天數</option>
                  {uniqueDates.map(date => (
                    <option key={date} value={date} className="text-slate-900 bg-white">
                      {date} ({formatDate(date)})
                    </option>
                  ))}
                </select>
             </div>
          </div>
          
          {/* Amount Display */}
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
               <span className="text-sm font-bold text-slate-400">NT$</span>
               <span className="text-4xl font-black text-white tracking-tight">{Number(totalTWD).toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
               <div className="px-2 py-0.5 rounded bg-white/10 border border-white/5 text-[10px] text-slate-300 font-medium">
                 ₩ {Number(totalKRW).toLocaleString()}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Form - Prevent shrinking */}
      <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex-shrink-0">
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="品項名稱 (如: 晚餐、伴手禮)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors"
          />
          <div className="flex gap-3">
             <div className="relative flex-1">
                <span className="absolute left-4 top-3.5 text-slate-400 text-xs font-bold">₩</span>
                <input 
                  type="number" 
                  value={krwAmount}
                  onChange={e => setKrwAmount(e.target.value)}
                  placeholder="韓元金額"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-20 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors"
                />
                {/* Embedded Approx Amount */}
                {krwAmount && (
                   <div className="absolute right-3 top-3.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded pointer-events-none">
                     ≈ ${Math.round(parseFloat(krwAmount) * rate).toLocaleString()}
                   </div>
                )}
             </div>
             <button 
               type="submit" 
               disabled={!title || !krwAmount}
               className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 active:scale-95"
             >
               <Plus size={24} />
             </button>
          </div>
        </div>
      </form>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-24 pr-1">
        {filteredExpenses.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-10 opacity-50">
             <Wallet size={48} className="text-slate-300 mb-2" />
             <p className="text-slate-400 font-bold text-sm">此區間無消費紀錄</p>
           </div>
        ) : (
          filteredExpenses.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between group active:scale-[0.99] transition-transform">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex flex-col items-center justify-center text-slate-500 flex-shrink-0">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">{formatDate(item.date).split('/')[0]}/{formatDate(item.date).split('/')[1]}</span>
                    <TrendingUp size={14} className="mt-0.5" />
                 </div>
                 <div className="min-w-0">
                   <div className="font-bold text-slate-800 text-sm truncate pr-2">{item.title}</div>
                   <div className="text-[10px] text-slate-400 font-medium">₩ {item.amountKRW.toLocaleString()}</div>
                 </div>
               </div>
               <div className="flex items-center gap-3 flex-shrink-0">
                 <div className="text-right">
                    <div className="font-black text-slate-800 text-sm">NT$ {item.amountTWD.toLocaleString()}</div>
                 </div>
                 <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
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