import React, { useEffect } from 'react';
import { Bell, Dumbbell, Utensils, Droplets, Pill, Sparkles, Award, X } from 'lucide-react';
import { audioService, SoundCategory } from '../services/audioService';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  category?: string;
  soundType?: SoundCategory;
  link?: string;
}

interface Props {
  toast: ToastNotification | null;
  onClose: () => void;
  onNavigate?: (link: string) => void;
}

export const NotificationToast: React.FC<Props> = ({ toast, onClose, onNavigate }) => {
  useEffect(() => {
    if (toast) {
      audioService.playSound(toast.soundType || 'DEFAULT');
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const getIcon = () => {
    const cat = (toast.category || '').toLowerCase();
    if (cat === 'workout') return <Dumbbell className="w-5 h-5 text-[#00D084]" />;
    if (cat === 'meal') return <Utensils className="w-5 h-5 text-amber-400" />;
    if (cat === 'hydration') return <Droplets className="w-5 h-5 text-cyan-400" />;
    if (cat === 'medicine') return <Pill className="w-5 h-5 text-rose-400" />;
    if (cat === 'ai' || cat === 'snap_check') return <Sparkles className="w-5 h-5 text-purple-400" />;
    if (cat === 'streak' || cat === 'progress') return <Award className="w-5 h-5 text-amber-300" />;
    return <Bell className="w-5 h-5 text-[#00D084]" />;
  };

  return (
    <div
      onClick={() => {
        if (toast.link && onNavigate) onNavigate(toast.link);
        onClose();
      }}
      className="fixed top-5 right-5 z-[9999] max-w-sm w-full bg-[#0D1728] border border-[#00D084]/60 p-4 rounded-2xl shadow-2xl animate-slideDown cursor-pointer text-white font-['Inter',sans-serif] flex items-start space-x-3 backdrop-blur-md"
    >
      <div className="p-2.5 rounded-xl bg-[#152238] border border-[#203350] flex-shrink-0">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-white truncate">{toast.title}</h4>
          <span className="text-[9px] font-extrabold text-[#00D084] uppercase tracking-wider bg-[#00D084]/15 px-1.5 py-0.5 rounded">
            Now
          </span>
        </div>
        <p className="text-xs text-[#9AA8BA] line-clamp-2 mt-0.5 leading-snug">{toast.message}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="p-1 text-[#9AA8BA] hover:text-white rounded-lg hover:bg-[#152238]"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
