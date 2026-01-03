import React, { useState, useEffect } from 'react';
import { Calculator, X, RefreshCw, ArrowRightLeft } from 'lucide-react';

const CurrencyCalculator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rate, setRate] = useState<number | null>(null);
  const [krw, setKrw] = useState('');
  const [twd, setTwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchRate = async () => {
    setLoading(true);
    try {
      // Free API for exchange rates
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
      const data = await res.json();
      if (data && data.rates && data.rates.TWD) {
        setRate(data.rates.TWD);
        const date = new Date(data.date || Date.now());
        setLastUpdated(date.toLocaleDateString());
      }
    } catch (error) {
      console.error("Failed to fetch rates", error);
      // Fallback rough estimate if offline
      setRate(0.024); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !rate) {
      fetchRate();
    }
  }, [isOpen]);

  const handleKrwChange = (val: string) => {
    const num = val.replace(/[^0-9.]/g, '');
    setKrw(num);
    if (rate && num) {
      setTwd((parseFloat(num) * rate).toFixed(0));
    } else {
      setTwd('');
    }
  };

  const handleTwdChange = (val: string) => {
    const num = val.replace(/[^0-9.]/g, '');
    setTwd(num);
    if (rate && num && rate !== 0) {
      setKrw((parseFloat(num) / rate).toFixed(0));
    } else {
      setKrw('');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-6 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-200 flex items-center justify-center transition-transform active:scale-95"
        title="匯率計算機"
      >
        <Calculator size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[320px] rounded-[32px] p-6 shadow-2xl relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ArrowRightLeft size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">匯率換算</h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              1 KRW ≈ {rate ? rate.toFixed(4) : '...'} TWD
              {loading && <RefreshCw size={10} className="animate-spin" />}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">韓元 (KRW)</label>
            <input 
              type="number" 
              value={krw}
              onChange={(e) => handleKrwChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-lg font-black text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-right"
              placeholder="0"
            />
            <span className="absolute left-4 top-[34px] text-sm font-bold text-slate-400">₩</span>
          </div>

          <div className="flex justify-center text-slate-300">
             <ArrowRightLeft size={16} className="rotate-90" />
          </div>

          <div className="relative">
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">台幣 (TWD)</label>
            <input 
              type="number" 
              value={twd}
              onChange={(e) => handleTwdChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-lg font-black text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-right"
              placeholder="0"
            />
            <span className="absolute left-4 top-[34px] text-sm font-bold text-slate-400">NT$</span>
          </div>
        </div>
        
        <p className="text-[10px] text-slate-300 text-center mt-6">
          匯率僅供參考，實際以交易當下為準 <br/> Updated: {lastUpdated}
        </p>
      </div>
    </div>
  );
};

export default CurrencyCalculator;