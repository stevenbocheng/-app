import React, { useState, useEffect } from 'react';
import { X, Key, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('GEMINI_API_KEY');
      if (storedKey) setApiKey(storedKey);
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      localStorage.removeItem('GEMINI_API_KEY');
    } else {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[320px] rounded-[32px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <Key size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">API 設定</h3>
            <p className="text-xs text-slate-400 font-medium">Bring Your Own Key</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <p className="text-[11px] text-slate-500 leading-relaxed flex gap-2">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-indigo-500" />
              <span>輸入您的 Google Gemini API Key 以啟用 AI 功能。金鑰僅會儲存在您的瀏覽器中。</span>
            </p>
          </div>

          <div className="relative">
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">Gemini API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
              placeholder="貼上您的 API Key"
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300 placeholder:font-normal"
            />
          </div>

          <button 
            onClick={handleSave}
            className={`w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${saved ? 'bg-green-500 shadow-green-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
          >
            {saved ? (
              <>
                <CheckCircle2 size={18} />
                <span>已儲存</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>儲存設定</span>
              </>
            )}
          </button>
          
          <div className="text-center">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] font-bold text-indigo-500 hover:underline"
            >
              取得免費 Gemini API Key &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;