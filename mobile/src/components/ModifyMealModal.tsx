import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, ArrowRightLeft, Sparkles, SlidersHorizontal } from 'lucide-react';
import { MealPlanItem, Food } from '../types';
import { mealPlanApi } from '../services/api';

interface Props {
  isOpen: boolean;
  item: MealPlanItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModifyMealModal: React.FC<Props> = ({ isOpen, item, onClose, onSuccess }) => {
  const [reason, setReason] = useState<string>('Different Food');
  const [dietFilter, setDietFilter] = useState<string>('veg');
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [replacing, setReplacing] = useState<boolean>(false);
  const [selectedAlt, setSelectedAlt] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reasons = [
    'Vegetarian',
    'Non-Vegetarian',
    'Higher Protein',
    'Lower Calories',
    'Don\'t Like It',
    'Not Available',
  ];

  useEffect(() => {
    if (isOpen && item) {
      loadAlternatives();
    }
  }, [isOpen, item, dietFilter]);

  const loadAlternatives = async () => {
    if (!item) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      let filter = dietFilter;
      if (reason === 'Vegetarian') filter = 'veg';
      if (reason === 'Non-Vegetarian') filter = 'non_veg';

      const res = await mealPlanApi.getAlternatives(item._id, filter);
      if (res.success && res.data?.alternatives) {
        setAlternatives(res.data.alternatives);
        if (res.data.alternatives.length > 0) {
          setSelectedAlt(res.data.alternatives[0]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load alternatives:', err);
      setErrorMsg('Failed to load alternative dishes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReasonChange = (selectedReason: string) => {
    setReason(selectedReason);
    if (selectedReason === 'Vegetarian') setDietFilter('veg');
    if (selectedReason === 'Non-Vegetarian') setDietFilter('non_veg');
  };

  const handleConfirmReplacement = async () => {
    if (!item || !selectedAlt) return;
    try {
      setReplacing(true);
      setErrorMsg(null);
      const res = await mealPlanApi.replaceItem(item._id, selectedAlt.food._id, selectedAlt.quantityG);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to replace meal.');
      }
    } catch (err: any) {
      console.error('Replacement error:', err);
      setErrorMsg(err.message || 'Error executing meal replacement.');
    } finally {
      setReplacing(false);
    }
  };

  if (!isOpen || !item) return null;

  const currentFood = (item.food || item.foodId) as Food;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-md p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-t-[28px] sm:rounded-[28px] p-5 space-y-4 max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
              <span>Modify Meal Item</span>
            </h3>
            <p className="text-xs text-slate-400">Replace {currentFood?.name || 'dish'} with regional alternative</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Current Food Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center space-x-3">
            <img
              src={currentFood?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
              alt={currentFood?.name}
              className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Current Dish</span>
              <h4 className="text-sm font-bold text-white truncate">{currentFood?.name}</h4>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                {item.calories} kcal • {item.proteinG}g Protein ({item.quantityG}g)
              </p>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold block flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Why do you want to change it?</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {reasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleReasonChange(r)}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition-all text-left truncate ${
                    reason === r
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {reason === r ? '✓ ' : ''}{r}
                </button>
              ))}
            </div>
          </div>

          {/* Alternatives List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Regional Replacements ({alternatives.length})</span>
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Scoring regional alternatives...</span>
              </div>
            ) : alternatives.length === 0 ? (
              <div className="p-4 bg-slate-800/50 rounded-2xl text-center text-xs text-slate-400">
                No matching alternative dishes found for this filter.
              </div>
            ) : (
              <div className="space-y-2">
                {alternatives.map((alt, idx) => {
                  const isSelected = selectedAlt?.food._id === alt.food._id;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedAlt(alt)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                          : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={alt.food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                          alt={alt.food.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-white truncate">{alt.food.name}</h5>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              {alt.score}% Score
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-slate-300 mt-1">
                            <span className="font-bold text-amber-400">{alt.calories} kcal</span>
                            <span>•</span>
                            <span className="font-bold text-emerald-400">{alt.proteinG}g P</span>
                            <span>•</span>
                            <span className="text-[11px] text-slate-400">{alt.quantityG}g portion</span>
                          </div>
                          {alt.reasons && alt.reasons.length > 0 && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{alt.reasons[0]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2 border-t border-slate-800 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmReplacement}
            disabled={replacing || !selectedAlt}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            {replacing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Replacing Meal...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Replace Meal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
