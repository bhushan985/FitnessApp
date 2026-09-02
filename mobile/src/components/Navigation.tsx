import React from 'react';
import { Home, Calendar, Plus, Dumbbell, User } from 'lucide-react';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAddTracker?: () => void;
}

export const Navigation: React.FC<Props> = ({ activeTab, onTabChange, onOpenAddTracker }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-5 flex items-center justify-between z-30 sm:rounded-b-[28px]">
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center space-y-1 transition-all ${
          activeTab === 'home' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] tracking-tight">Home</span>
      </button>

      <button
        onClick={() => onTabChange('meals')}
        className={`flex flex-col items-center justify-center space-y-1 transition-all ${
          activeTab === 'meals' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Calendar className={`w-5 h-5 ${activeTab === 'meals' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] tracking-tight">Meals</span>
      </button>

      {/* Central Quick Add Action Button */}
      <button
        onClick={() => {
          if (onOpenAddTracker) onOpenAddTracker();
        }}
        className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-110 active:scale-95 transition -mt-5 border-2 border-slate-950"
        title="Track Health & Fitness"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      <button
        onClick={() => onTabChange('workout')}
        className={`flex flex-col items-center justify-center space-y-1 transition-all ${
          activeTab === 'workout' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Dumbbell className={`w-5 h-5 ${activeTab === 'workout' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] tracking-tight">Workout</span>
      </button>

      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center justify-center space-y-1 transition-all ${
          activeTab === 'profile' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] tracking-tight">Profile</span>
      </button>
    </div>
  );
};
