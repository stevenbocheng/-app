import React from 'react';
import { 
  MapPin, Utensils, ShoppingBag, Camera, Coffee, Landmark, 
  Wallet, Sparkles, Loader2, Trash2, ArrowUp, ArrowDown 
} from 'lucide-react';
import { ItineraryItem } from '../types';

const getCategoryStyle = (category: string) => {
  const text = (category || '').toLowerCase();
  if (text.includes('食') || text.includes('餐') || text.includes('food') || text.includes('cafe')) {
    return { bg: 'bg-orange-50', text: 'text-orange-600', icon: <Utensils size={10} /> };
  }
  if (text.includes('咖') || text.includes('coffee') || text.includes('茶')) {
    return { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Coffee size={10} /> };
  }
  if (text.includes('購') || text.includes('買') || text.includes('shop') || text.includes('mall')) {
    return { bg: 'bg-pink-50', text: 'text-pink-600', icon: <ShoppingBag size={10} /> };
  }
  if (text.includes('景') || text.includes('遊') || text.includes('看') || text.includes('sight')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <Camera size={10} /> };
  }
  if (text.includes('史') || text.includes('古') || text.includes('宫') || text.includes('museum')) {
    return { bg: 'bg-stone-100', text: 'text-stone-600', icon: <Landmark size={10} /> };
  }
  return { bg: 'bg-blue-50', text: 'text-blue-600', icon: <MapPin size={10} /> };
};

interface ItineraryCardProps {
  item: ItineraryItem;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onGenerateInsight: (id: string, title: string) => void;
  loadingInsight: boolean;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ 
  item, index, total, onMoveUp, onMoveDown, onDelete, onGenerateInsight, loadingInsight
}) => {
  const catStyle = getCategoryStyle(item.category);

  const handleOpenNaverMap = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const query = encodeURIComponent(item.addressKR || item.address);
    window.open(`https://map.naver.com/v5/search/${query}`, '_blank');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    onDelete();
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveUp();
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveDown();
  };

  return (
    <div className="bg-white rounded-[20px] mb-4 p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 border border-slate-50 group relative overflow-hidden">
      {index !== total - 1 && (
        <div className="absolute left-[29px] top-[60px] bottom-[-20px] w-[2px] bg-slate-100 -z-10 group-hover:bg-blue-50 transition-colors"></div>
      )}
      <div className="flex items-start gap-4">
        {/* Time Column */}
        <div className="flex flex-col items-center pt-1 min-w-[3.5rem]">
          <span className="text-sm font-bold text-slate-800">{item.time.split(' ')[0]}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{item.time.split(' ')[1]}</span>
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 ring-4 ring-blue-50"></div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${catStyle.bg} ${catStyle.text}`}>
              {catStyle.icon}
              {item.category}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 truncate">{item.title}</h3>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center text-slate-500 gap-1.5 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={handleOpenNaverMap}>
              <MapPin size={14} className="flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs truncate font-medium">{item.address}</span>
              </div>
            </div>
            {item.budget && (
              <div className="flex items-center text-emerald-600 gap-1.5">
                <Wallet size={14} className="flex-shrink-0" />
                <span className="text-xs font-bold">{item.budget}</span>
              </div>
            )}
          </div>

           {!item.aiInsight ? (
            <button 
              onClick={(e) => { e.stopPropagation(); onGenerateInsight(item.id, item.title); }}
              disabled={loadingInsight}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-50 border border-slate-100 hover:border-indigo-100 z-10 relative"
            >
              {loadingInsight ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              <span>AI 導遊解說</span>
            </button>
          ) : (
            <div className="mt-3 bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50 animate-in fade-in duration-500">
               <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-indigo-900/80 leading-relaxed font-medium">{item.aiInsight}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Actions Column */}
        <div className="flex flex-col gap-2 relative z-30">
          <button 
            onClick={handleDelete} 
            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors active:scale-95 shadow-sm border border-slate-100" 
            title="刪除"
          >
            <Trash2 size={16} />
          </button>
          <div className="flex flex-col gap-1 bg-slate-50 rounded-xl p-1 shadow-sm border border-slate-100">
            <button onClick={handleMoveUp} disabled={index === 0} className={`p-1 rounded-lg ${index === 0 ? 'text-slate-200' : 'text-slate-400 hover:text-blue-600 hover:bg-white'}`}>
              <ArrowUp size={16} />
            </button>
            <button onClick={handleMoveDown} disabled={index === total - 1} className={`p-1 rounded-lg ${index === total - 1 ? 'text-slate-200' : 'text-slate-400 hover:text-blue-600 hover:bg-white'}`}>
              <ArrowDown size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryCard;