import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle, Sparkles, Filter } from 'lucide-react';
import { MealPlanItem, MealReplacementAlternative } from '../types';
import { mealPlanApi } from '../services/api';

interface Props {
  item: MealPlanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReplaceMealModal: React.FC<Props> = ({ item, isOpen, onClose, onSuccess }) => {
  const [dietFilter, setDietFilter] = useState<'veg' | 'non_veg' | 'eggetarian'>('veg');
  const [alternatives, setAlternatives] = useState<MealReplacementAlternative[]>([]);
  const [selectedAlt, setSelectedAlt] = useState<MealReplacementAlternative | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [replacing, setReplacing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && item) {
      loadAlternatives();
    }
  }, [isOpen, item, dietFilter]);

  const loadAlternatives = async () => {
    if (!item) return;
    try {
      setLoading(true);
      const res = await mealPlanApi.getAlternatives(item._id, dietFilter);
      if (res.success && res.data?.alternatives) {
        setAlternatives(res.data.alternatives);
        if (res.data.alternatives.length > 0) {
          setSelectedAlt(res.data.alternatives[0]);
        }
      }
    } catch (err) {
      console.error('Failed loading meal alternatives:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReplace = async () => {
    if (!item || !selectedAlt) return;
    try {
      setReplacing(true);
      await mealPlanApi.replaceItem(item._id, selectedAlt.food._id, selectedAlt.quantityG);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed replacing meal:', err);
    } finally {
      setReplacing(false);
    }
  };

  if (!isOpen || !item) return null;

  const currentFood = item.food;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-t-[28px] sm:rounded-[28px] p-5 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
              <span>Modify / Replace Meal</span>
            </h3>
            <p className="text-xs text-slate-400">
              Replacing: <span className="text-emerald-300 font-semibold">{currentFood?.name}</span> ({item.calories} kcal)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Meal Summary Card */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Current Choice</span>
            <span className="text-sm font-bold text-white">{currentFood?.name}</span>
            <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
              <span>{item.quantityG}g</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{item.calories} kcal</span>
              <span>•</span>
              <span className="text-teal-300">{item.proteinG}g Protein</span>
            </div>
          </div>
        </div>

        {/* Diet Filter Pills */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Filter Alternatives</span>
            </span>
            <span>{alternatives.length} candidates</span>
          </div>
          <div className="flex items-center space-x-2 pt-1">
            {(['veg', 'non_veg', 'eggetarian'] as const).map((filter) => {
              const active = dietFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setDietFilter(filter)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    active
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}
                >
                  {filter.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alternatives List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-10 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Finding region & macro matched alternatives...</p>
            </div>
          ) : alternatives.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No compatible alternatives found for this filter. Try changing diet filter.
            </div>
          ) : (
            alternatives.map((alt) => {
              const isSelected = selectedAlt?.food._id === alt.food._id;
              const calDiff = alt.calorieDelta;
              const protDiff = alt.proteinDelta;

              return (
                <div
                  key={alt.food._id}
                  onClick={() => setSelectedAlt(alt)}
                  className={`border rounded-2xl p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={alt.food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                      alt={alt.food.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white truncate">{alt.food.name}</h4>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {alt.score}% Score
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Portion: {alt.quantityG}g serving</p>

                      <div className="flex items-center space-x-3 mt-2 text-xs">
                        <span className="font-bold text-white">{alt.calories} kcal</span>
                        <span className="text-emerald-400 font-semibold">{alt.proteinG}g Protein</span>
                        <span className="text-amber-300 font-semibold">{alt.carbsG}g Carbs</span>
                      </div>
                    </div>
                  </div>

                  {/* Macro Delta Indicator */}
                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Impact vs Current Meal:</span>
                    <div className="flex items-center space-x-2 font-bold">
                      <span className={calDiff <= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                        {calDiff > 0 ? `+${calDiff}` : calDiff} kcal
                      </span>
                      <span className={protDiff >= 0 ? 'text-teal-300' : 'text-rose-400'}>
                        {protDiff > 0 ? `+${protDiff}` : protDiff}g Protein
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmReplace}
            disabled={!selectedAlt || replacing}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            {replacing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Replacing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Replacement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
