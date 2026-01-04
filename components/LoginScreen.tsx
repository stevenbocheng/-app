import React, { useState } from 'react';
import { Plane, User, Lock, Loader2, ChevronRight, CheckSquare, Square } from 'lucide-react';
import { updateSheetData } from '../services/googleSheets';

interface LoginScreenProps {
  onLogin: (user: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    try {
      const result = await updateSheetData('login', { username, password });
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('seoul_travel_user', JSON.stringify(result.user));
        }
        onLogin(result.user);
      } else {
        setError(result.error || '登入失敗');
      }
    } catch (err) {
      setError('連線失敗，請檢查網路或設定');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F8FAFC] flex flex-col items-center justify-center p-8 rounded-[40px] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>

      <form onSubmit={handleLogin} className="w-full max-w-[320px] flex flex-col items-center relative z-10">
        <div className="mb-8 relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-blue-200 transform rotate-12">
            <Plane size={40} className="text-white -rotate-12" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-1 text-center">Seoul Planner</h1>
        <p className="text-slate-400 text-xs mb-8 text-center font-medium">
          請輸入您的帳號密碼以開啟旅程
        </p>

        <div className="w-full space-y-4 mb-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="使用者帳號"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 font-bold text-slate-700 shadow-sm transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密碼"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 font-bold text-slate-700 shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
            >
              {rememberMe ? (
                <CheckSquare size={18} className="text-blue-600" />
              ) : (
                <Square size={18} className="text-slate-300" />
              )}
              <span className="text-xs font-bold">永久登入</span>
            </button>
            <span className="text-xs font-medium text-slate-300">忘記密碼？</span>
          </div>
        </div>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-slate-200 hover:bg-black active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              <span>開始旅程</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-300 mt-8 text-center leading-relaxed font-medium">
          若尚未擁有帳號，請聯繫管理員建立 <br />
          系統將自動驗證您的 Google Sheets 憑證
        </p>
      </form>
    </div>
  );
};

export default LoginScreen;
