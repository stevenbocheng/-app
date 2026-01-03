import React, { useState } from 'react';
import { X, Search, Sparkles, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { ItineraryItem } from '../types';
import { getPlaceDetails } from '../services/gemini';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Partial<ItineraryItem>) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [addressKR, setAddressKR] = useState('');
  const [budget, setBudget] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleAutoSearch = async () => {
    if (!title) {
      alert("請先輸入景點名稱");
      return;
    }
    setIsSearching(true);
    try {
      const data = await getPlaceDetails(title);
      if (data.address) setAddress(data.address);
      if (data.addressKR) setAddressKR(data.addressKR);
      if (data.category) setCategory(data.category);
      if (data.budget) setBudget(data.budget);
    } catch (e) {
      console.error("Auto search failed", e);
      alert("AI 搜尋失敗，請手動輸入");
    } finally {
      setIsSearching(false);
    }
  };

  const handleTestMap = () => {
    const query = encodeURIComponent(addressKR || address || title);
    window.open(`https://map.naver.com/v5/search/${query}`, '_blank');
  };

  const handleSubmit = () => {
    if (!title) return;
    onAdd({
      title, 
      time: time || '10:00 AM', 
      category: category || '自訂行程', 
      address: address || '首爾', 
      addressKR: addressKR,
      budget
    });
    setTitle(''); setTime(''); setCategory(''); setAddress(''); setAddressKR(''); setBudget('');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4 bg-slate-900/20 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white w-full sm:rounded-[32px] rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">新增行程</h3>
            <p className="text-xs text-slate-400 mt-1">輸入店名，讓 AI 幫您找精準韓文地址</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">景點 / 店家名稱</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="例如: Onion Anguk" className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 placeholder:text-slate-400" />
              </div>
              <button onClick={handleAutoSearch} disabled={isSearching || !title} className="px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>AI 填寫</span>
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1/3">
              <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">時間</label>
              <input type="text" value={time} onChange={e => setTime(e.target.value)} placeholder="10:00 AM" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-sm font-medium" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">類別</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="自動偵測..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-sm font-medium" />
            </div>
          </div>
          <div className="flex gap-3">
             <div className="flex-1">
              <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">顯示地址 (中文)</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="用於顯示" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-sm font-medium text-slate-600" />
            </div>
             <div className="w-1/3">
              <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">預算</label>
              <input type="text" value={budget} onChange={e => setBudget(e.target.value)} placeholder="₩..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-sm font-medium text-emerald-600" />
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between items-end mb-1">
              <label className="text-xs font-bold text-slate-400 ml-1">韓文地址 (用於地圖導航)</label>
              <button onClick={handleTestMap} className="text-[10px] text-blue-500 font-bold flex items-center gap-1 hover:text-blue-600">
                <ExternalLink size={10} />
                測試地圖連結
              </button>
            </div>
            <input type="text" value={addressKR} onChange={e => setAddressKR(e.target.value)} placeholder="AI 將自動填入韓文地址..." className="w-full px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:outline-none focus:border-blue-500 text-sm font-medium text-slate-600" />
          </div>
        </div>
        <button onClick={handleSubmit} disabled={!title} className={`w-full mt-6 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 ${!title ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-lg shadow-blue-200'}`}>
          <CheckCircle2 size={18} />
          <span>確認新增</span>
        </button>
        <div className="h-4 sm:h-0" /> 
      </div>
    </div>
  );
};

export default AddItemModal;