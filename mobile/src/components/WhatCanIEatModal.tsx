import React, { useState, useEffect } from 'react';
import { X, Sparkles, Utensils, CheckCircle2, RefreshCw, Flame, Heart, Tag } from 'lucide-react';
import { recommendationApi, mealLogApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WhatCanIEatModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRecommendations();
    }
  }, [isOpen]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await recommendationApi.getEatNowRecommendations();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load Eat Now recommendations:', err);
      setErrorMsg('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogRecommendation = async (rec: any) => {
    try {
      setLoggingId(rec.food._id);
      await mealLogApi.logMeal({
        foodId: rec.food._id,
        mealType: 'snack',
        quantityG: rec.quantityG,
        calories: rec.calories,
        proteinG: rec.proteinG,
        carbsG: rec.carbsG,
        fatG: rec.fatG,
        consumedAt: new Date(),
        source: 'recommendation',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to log meal:', err);
      setErrorMsg('Failed to log meal to tracker.');
    } finally {
      setLoggingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-md p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-t-[28px] sm:rounded-[28px] p-5 space-y-4 max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <span>What Can I Eat Right Now?</span>
            </h3>
            <p className="text-xs text-slate-400">Personalized local choices matching remaining macros</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {data?.remaining && (
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Remaining Target Today</span>
              <div className="flex items-center space-x-3 text-xs text-white font-bold mt-0.5">
                <span className="text-emerald-400">🔥 {data.remaining.remainingCalories} kcal</span>
                <span>💪 {data.remaining.remainingProtein}g Protein</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Budget</span>
              <span className="text-xs font-bold text-amber-400">₹{data.budget} / day</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Evaluating regional food availability & remaining macros...</span>
            </div>
          ) : !data?.recommendations || data.recommendations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No regional dish recommendations found.
            </div>
          ) : (
            data.recommendations.map((rec: any, idx: number) => (
              <div key={idx} className="bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 p-4 rounded-2xl space-y-3 shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <img
                    src={rec.food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                    alt={rec.food.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate">{rec.food.name}</h4>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {rec.score}% Match
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-300 mt-1 font-semibold">
                      <span className="text-amber-400">{rec.calories} kcal</span>
                      <span>•</span>
                      <span className="text-emerald-400">{rec.proteinG}g P</span>
                      <span>•</span>
                      <span className="text-slate-400">₹{rec.estimatedCostRs} ({rec.quantityG}g)</span>
                    </div>
                  </div>
                </div>

                {/* Explanation Reasons */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Why this meal?</span>
                  {rec.reasons.map((r: string, rIdx: number) => (
                    <p key={rIdx} className="text-[11px] text-emerald-300/90 font-medium">
                      {r}
                    </p>
                  ))}
                </div>

                <button
                  onClick={() => handleLogRecommendation(rec)}
                  disabled={loggingId === rec.food._id}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-md transition-all"
                >
                  {loggingId === rec.food._id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Log Meal & Adapt Daily Plan</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
