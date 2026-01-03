import React from 'react';
import { Navigation, Copy } from 'lucide-react';
import { ItineraryItem } from '../types';

interface RouteItemCardProps {
  item: ItineraryItem;
  index: number;
  total: number;
}

const RouteItemCard: React.FC<RouteItemCardProps> = ({ item, index, total }) => {
  const handleOpenNaverMap = () => {
    const query = encodeURIComponent(item.addressKR || item.address);
    window.open(`https://map.naver.com/v5/search/${query}`, '_blank');
  };

  const handleCopyKR = () => {
    const text = item.addressKR || item.address;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('已複製地址');
        }).catch(() => {
             alert('複製失敗');
        });
    } else {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert('已複製地址');
        } catch (err) {
            alert('複製失敗');
        }
        document.body.removeChild(textArea);
    }
  };

  return (
    <div className="flex gap-4 mb-6 relative">
       <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold z-10 border-4 border-white shadow-md">
          {index + 1}
        </div>
        {index !== total - 1 && (
          <div className="w-1 bg-slate-200 h-full absolute top-8 bottom-[-24px] z-0"></div>
        )}
       </div>
       <div className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
         <div className="flex justify-between items-start mb-2">
           <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">{item.time}</span>
         </div>
         <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
         <p className="text-xs text-slate-500 mb-4">{item.addressKR || item.address}</p>
         <div className="flex gap-2">
            <button onClick={handleOpenNaverMap} className="flex-1 bg-[#03C75A] hover:bg-[#02b351] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-100">
              <Navigation size={16} />
              導航
            </button>
            <button onClick={handleCopyKR} className="w-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center active:scale-95 transition-all">
              <Copy size={18} />
            </button>
         </div>
       </div>
    </div>
  );
};

export default RouteItemCard;