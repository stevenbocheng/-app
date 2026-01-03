import React from 'react';
import { KeyRound, LogOut } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onLogout: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, tripId, onLogout }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-start justify-end p-4 pt-20">
      <div className="bg-white rounded-2xl shadow-xl w-64 p-4 animate-in slide-in-from-top-4 duration-200">
        <div className="flex items-center gap-3 mb-4 border-b border-slate-50 pb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
             <KeyRound size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">目前旅程 ID</p>
            <p className="text-xs text-slate-500 truncate font-mono bg-slate-100 px-2 py-0.5 rounded mt-1">{tripId}</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-slate-500 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          <span>登出 (切換帳號)</span>
        </button>
        <button 
          onClick={onClose}
          className="w-full mt-2 text-slate-300 text-xs hover:text-slate-500 py-1"
        >
          關閉
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;