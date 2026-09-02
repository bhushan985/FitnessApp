import React from 'react';
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

interface Props {
  trialDaysRemaining: number;
  isTrialActive: boolean;
  isExpired: boolean;
  onUpgrade: () => void;
}

export const TrialBanner: React.FC<Props> = ({ trialDaysRemaining, isTrialActive, isExpired, onUpgrade }) => {
  if (isExpired) {
    return (
      <div className="bg-gradient-to-r from-rose-900/90 to-amber-900/90 border-b border-rose-700/50 px-4 py-2.5 flex items-center justify-between shadow-lg text-white">
        <div className="flex items-center space-x-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <p className="text-xs font-bold truncate">Your 30-Day Free Trial Has Ended</p>
        </div>
        <button
          onClick={onUpgrade}
          className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-xl text-xs font-extrabold flex items-center space-x-1 shrink-0 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
        >
          <span>Upgrade Now</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (isTrialActive) {
    return (
      <div className="bg-gradient-to-r from-emerald-900/80 via-slate-900 to-teal-950 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2 min-w-0">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold truncate text-emerald-100">
            Free Trial — <span className="text-emerald-400 font-extrabold">{trialDaysRemaining} days remaining</span>
          </p>
        </div>
        <button
          onClick={onUpgrade}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 underline decoration-emerald-500/50"
        >
          <span>View Plans</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return null;
};
