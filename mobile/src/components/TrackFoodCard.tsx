import React from 'react';
import { Camera, Search, Plus, Utensils, Flame, Sparkles, Clock, Heart, Trash2, Edit2 } from 'lucide-react';

interface Props {
  targetCalories: number;
  consumedSummary: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  targets: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  recentFoods: any[];
  favorites: any[];
  onOpenSnapCheck: () => void;
  onOpenSearch: () => void;
  onOpenAddFood: () => void;
  onQuickLogFood: (foodName: string, grams: number, nutrition: any) => void;
  onDeleteLog?: (logId: string) => void;
  todayLogs?: any[];
}

export const TrackFoodCard: React.FC<Props> = ({
  targetCalories,
  consumedSummary,
  targets,
  recentFoods,
  favorites,
  onOpenSnapCheck,
  onOpenSearch,
  onOpenAddFood,
  onQuickLogFood,
  onDeleteLog,
  todayLogs = [],
}) => {
  const consumed = consumedSummary.calories;
  const remaining = Math.max(0, targetCalories - consumed);
  const calPercent = Math.min(100, Math.round((consumed / (targetCalories || 2000)) * 100));

  const proteinPct = Math.min(100, Math.round((consumedSummary.protein / (targets.protein || 120)) * 100));
  const carbsPct = Math.min(100, Math.round((consumedSummary.carbohydrates / (targets.carbs || 300)) * 100));
  const fatPct = Math.min(100, Math.round((consumedSummary.fat / (targets.fat || 75)) * 100));
  const fiberPct = Math.min(100, Math.round((consumedSummary.fiber / (targets.fiber || 30)) * 100));

  return (
    <div className="space-y-4">
      {/* Primary Hero Track Food Card */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Glow accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Card Header & Calorie Ring */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Track What You Ate
            </span>
            <h2 className="text-xl font-black text-white mt-1">Track Food</h2>
            <p className="text-xs text-slate-400">
              Target: <span className="text-emerald-400 font-bold">{targetCalories.toLocaleString()} Cal</span>
            </p>
          </div>

          {/* Calorie Stats Circle Badge */}
          <div className="text-right bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-inner">
            <span className="text-xs text-slate-400 font-bold block">Consumed</span>
            <span className="text-xl font-black text-emerald-400">{consumed}</span>
            <span className="text-[10px] text-slate-400 block font-semibold">/ {targetCalories} Cal</span>
          </div>
        </div>

        {/* Total Calorie Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-slate-300">Daily Calorie Budget ({calPercent}%)</span>
            <span className="text-emerald-400">{remaining} Cal Remaining</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${calPercent}%` }}
            />
          </div>
        </div>

        {/* Macro Matrix Grid */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {/* Protein */}
          <div className="bg-slate-900/80 border border-slate-700/60 p-2.5 rounded-2xl space-y-1">
            <div className="flex justify-between items-center text-[10px] font-extrabold">
              <span className="text-emerald-400 uppercase">Protein</span>
              <span className="text-slate-300">{proteinPct}%</span>
            </div>
            <div className="text-xs font-black text-white">
              {consumedSummary.protein} <span className="text-[9px] font-normal text-slate-400">/ {targets.protein}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${proteinPct}%` }} />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-slate-900/80 border border-slate-700/60 p-2.5 rounded-2xl space-y-1">
            <div className="flex justify-between items-center text-[10px] font-extrabold">
              <span className="text-amber-400 uppercase">Carbs</span>
              <span className="text-slate-300">{carbsPct}%</span>
            </div>
            <div className="text-xs font-black text-white">
              {consumedSummary.carbohydrates} <span className="text-[9px] font-normal text-slate-400">/ {targets.carbs}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${carbsPct}%` }} />
            </div>
          </div>

          {/* Fat */}
          <div className="bg-slate-900/80 border border-slate-700/60 p-2.5 rounded-2xl space-y-1">
            <div className="flex justify-between items-center text-[10px] font-extrabold">
              <span className="text-rose-400 uppercase">Fats</span>
              <span className="text-slate-300">{fatPct}%</span>
            </div>
            <div className="text-xs font-black text-white">
              {consumedSummary.fat} <span className="text-[9px] font-normal text-slate-400">/ {targets.fat}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${fatPct}%` }} />
            </div>
          </div>

          {/* Fibre */}
          <div className="bg-slate-900/80 border border-slate-700/60 p-2.5 rounded-2xl space-y-1">
            <div className="flex justify-between items-center text-[10px] font-extrabold">
              <span className="text-cyan-400 uppercase">Fibre</span>
              <span className="text-slate-300">{fiberPct}%</span>
            </div>
            <div className="text-xs font-black text-white">
              {consumedSummary.fiber} <span className="text-[9px] font-normal text-slate-400">/ {targets.fiber}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${fiberPct}%` }} />
            </div>
          </div>
        </div>

        {/* Primary Food Logging Action Buttons */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {/* Snap Check Button */}
          <button
            onClick={onOpenSnapCheck}
            className="py-3 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Camera className="w-4.5 h-4.5 shrink-0 text-slate-950" />
            <span>Snap Check</span>
          </button>


          {/* 🔍 Search Food */}
          <button
            onClick={onOpenSearch}
            className="py-3 px-3 bg-slate-700/90 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 border border-slate-600 active:scale-95 transition-all"
          >
            <Search className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Search Meals</span>
          </button>

          {/* ＋ Add Food */}
          <button
            onClick={onOpenAddFood}
            className="py-3 px-3 bg-slate-700/90 hover:bg-slate-700 text-emerald-400 font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 border border-slate-600 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Food</span>
          </button>
        </div>
      </div>

      {/* Today's Logged Meals Section */}
      {todayLogs && todayLogs.length > 0 && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>Today's Logged Meals</span>
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold">
              {todayLogs.length} item{todayLogs.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-2">
            {todayLogs.map((log: any) => (
              <div
                key={log._id}
                className="bg-slate-900/80 border border-slate-700/70 p-3 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-sm">
                    {log.foodName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{log.foodName}</h4>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {log.mealType} • {log.grams}g • <span className="text-emerald-400 font-bold">{log.nutrition?.calories || 0} kcal</span>
                    </p>
                  </div>
                </div>

                {onDeleteLog && (
                  <button
                    onClick={() => onDeleteLog(log._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Re-log Section (Recent & Favorites) */}
      {(recentFoods.length > 0 || favorites.length > 0) && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Quick Log Again</span>
          </h3>

          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {recentFoods.map((rf: any) => (
              <button
                key={rf._id}
                onClick={() => onQuickLogFood(rf.foodName, rf.grams, rf.nutrition)}
                className="bg-slate-900 hover:bg-slate-700/80 border border-slate-700 px-3 py-2 rounded-xl text-left shrink-0 transition space-y-0.5"
              >
                <span className="text-xs font-bold text-white block truncate max-w-[110px]">{rf.foodName}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {rf.grams}g • {rf.nutrition?.calories} kcal
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
