import React, { useState } from 'react';
import { Plane, KeyRound, Loader2, ChevronRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (tripId: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [tripId, setTripId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!tripId) return;
    setLoading(true);
    setTimeout(() => onLogin(tripId), 800);
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F8FAFC] flex flex-col items-center justify-center p-8 rounded-[40px]">
      <div className="w-full max-w-[300px] flex flex-col items-center">
        <div className="mb-8 relative">
           <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 relative z-10">
              <Plane size={48} className="text-blue-600" />
           </div>
           <div className="absolute top-0 -left-4 w-32 h-32 bg-blue-50 rounded-full animate-pulse z-0"></div>
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 mb-2 text-center">Seoul Planner</h1>
        <p className="text-slate-400 text-sm mb-8 text-center leading-relaxed">
          輸入您的專屬旅程代碼 (Trip ID) <br/> 以登入或建立新的行程表
        </p>
        
        <div className="w-full relative mb-4">
          <KeyRound className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input 
            type="text" 
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            placeholder="例如: my-seoul-2024"
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-bold text-slate-700 text-center"
          />
        </div>

        <button 
          onClick={handleLogin}
          disabled={loading || !tripId}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              <span>開始旅程</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
        
        <p className="text-[10px] text-slate-300 mt-6 text-center">
          * 請記住此代碼，之後登入需要使用它來還原資料
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;