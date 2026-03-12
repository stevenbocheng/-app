import React, { useState, useEffect } from 'react';
import { Mail, Lock, Loader2, ChevronRight, X, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { updateSheetData } from '../services/googleSheets';
import ForgotPasswordModal from './ForgotPasswordModal';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const validateForm = () => {
    if (isOffline) {
      setError('您目前處於離線狀態，請檢查網路連線。');
      return false;
    }
    
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('請輸入有效的電子信箱。');
      return false;
    }

    if (password.length < 6) {
      setError('密碼長度需至少 6 個字元。');
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('兩次輸入的密碼不符。');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const action = isLogin ? 'login' : 'register';
      const result = await updateSheetData(action, { username: cleanEmail, password });
      
      if (result.success) {
        onSuccess(result.user);
      } else {
        setError(result.error || (isLogin ? '登入失敗' : '註冊失敗'));
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError('連線失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-[400px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-12">
          <div className="flex flex-col items-center mb-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-500 ${isLogin ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
            </div>
            <h2 className="text-2xl font-black text-slate-800">
              {isLogin ? '歡迎回來' : '建立帳號'}
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {isLogin ? '登入以繼續規劃您的旅程' : '開始您的首爾旅遊規劃'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="電子信箱"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 font-bold text-slate-700 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密碼 (至少 6 碼)"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 font-bold text-slate-700 transition-all"
              />
            </div>

            {!isLogin && (
              <div className="relative animate-in slide-in-from-top-2 duration-300">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="確認密碼"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 font-bold text-slate-700 transition-all"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in shake-in duration-300">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-red-600 text-xs font-bold leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-white shadow-xl transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isLogin 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? '登入' : '註冊'}</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              {isLogin ? '還沒有帳號？立即註冊' : '已有帳號？返回登入'}
            </button>
            {isLogin && (
              <div>
                <button 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors"
                >
                  忘記密碼？
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-6 flex justify-center">
          <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
            登入即代表您同意服務條款與隱私權政策 <br />
            © {new Date().getFullYear()} Seoul Travel Planner
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
