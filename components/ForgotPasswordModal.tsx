import React, { useState, useEffect } from 'react';
import { Mail, Loader2, ChevronRight, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updateSheetData } from '../services/googleSheets';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('請輸入有效的電子信箱。');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateSheetData('reset_password', { username: cleanEmail });
      
      if (result.success) {
        setSent(true);
        setCooldown(60); // 60 seconds cooldown
      } else {
        setError(result.error || '發送失敗');
      }
    } catch (err: any) {
      console.error('Reset error:', err);
      setError('連線失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-[400px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-12">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Mail size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">重設密碼</h2>
            <p className="text-slate-400 text-sm font-medium mt-1 text-center">
              請輸入您的註冊信箱，我們將透過系統處理您的重設請求
            </p>
          </div>

          {sent ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col items-center gap-4 p-8 bg-green-50 rounded-3xl border border-green-100">
                <CheckCircle2 size={48} className="text-green-500" />
                <div className="text-center">
                  <p className="text-green-800 font-bold mb-1">重設請求已提交</p>
                  <p className="text-green-600 text-xs font-medium">
                    若帳號存在，系統將發送重設指令或通知管理員。
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
              >
                回到登入
              </button>
              
              {cooldown > 0 && (
                <p className="text-center text-[10px] text-slate-400 font-bold">
                  需等待 {cooldown} 秒後才能再次發送
                </p>
              )}
            </div>
          ) : (
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

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <p className="text-red-600 text-xs font-bold leading-tight">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <span>{cooldown > 0 ? `等待中 (${cooldown}s)` : '提交重設請求'}</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
              >
                取消
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
