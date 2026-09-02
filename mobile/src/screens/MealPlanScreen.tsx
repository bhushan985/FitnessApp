import React, { useState } from 'react';
import { Sparkles, CheckCircle2, RefreshCw, Info, Utensils, RotateCcw } from 'lucide-react';
import { MealPlanItem, MealPlan } from '../types';
import { ReplaceMealModal } from '../components/ReplaceMealModal';
import { mealPlanApi } from '../services/api';

interface Props {
  mealPlan: MealPlan | null;
  mealItems: MealPlanItem[];
  currentDietType: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  onDietTypeChange: (dietType: 'veg' | 'non_veg' | 'eggetarian' | 'vegan') => void;
  onToggleItem: (itemId: string, currentStatus: boolean) => void;
  onSelectFood: (foodId: string) => void;
  onRegenerate: () => void;
  onRefreshPlan: () => void;
}

export const MealPlanScreen: React.FC<Props> = ({
  mealPlan,
  mealItems,
  currentDietType,
  onDietTypeChange,
  onToggleItem,
  onSelectFood,
  onRegenerate,
  onRefreshPlan,
}) => {
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<string>('all');
  const [replacingItem, setReplacingItem] = useState<MealPlanItem | null>(null);
  const [dietSwitching, setDietSwitching] = useState<boolean>(false);

  const slots = ['all', 'breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner'];

  const filteredItems = selectedSlotFilter === 'all'
    ? mealItems
    : mealItems.filter((i) => i.mealType === selectedSlotFilter);

  const handleDietSwitch = async (newDiet: 'veg' | 'non_veg' | 'eggetarian' | 'vegan') => {
    if (newDiet === currentDietType) return;
    try {
      setDietSwitching(true);
      onDietTypeChange(newDiet);
      await mealPlanApi.updateTodayDietType(newDiet);
      onRefreshPlan();
    } catch (err) {
      console.error('Failed to switch daily diet type:', err);
    } finally {
      setDietSwitching(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-900 text-white overflow-y-auto pb-24 p-5 space-y-5">
      {/* Top Title */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Today's Meal Plan</h2>
          <p className="text-xs text-slate-400">5-slot region-aware solver scaled to your macros</p>
        </div>
        <button
          onClick={onRegenerate}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md shadow-emerald-500/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Plan</span>
        </button>
      </div>

      {/* FEATURE A: Daily Diet Type Switch Selector */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center space-x-1.5">
            <Utensils className="w-3.5 h-3.5 text-emerald-400" />
            <span>Today's Active Diet Mode</span>
          </span>
          <span className="text-[10px] text-slate-400">Temporary override for today</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {(['veg', 'non_veg', 'eggetarian', 'vegan'] as const).map((dt) => {
            const isSelected = currentDietType === dt;
            return (
              <button
                key={dt}
                onClick={() => handleDietSwitch(dt)}
                disabled={dietSwitching}
                className={`py-2 px-3 rounded-xl text-xs font-bold capitalize flex items-center justify-center space-x-1 transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{isSelected ? '✓ ' : ''}{dt.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan Totals Summary Bar */}
      <div className="bg-slate-800 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Calories</span>
          <span className="text-lg font-extrabold text-white">{mealPlan?.targetCalories || 2100} kcal</span>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Planned Total</span>
          <span className="text-lg font-extrabold text-emerald-400">{mealPlan?.totalCalories || 2050} kcal</span>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Protein</span>
          <span className="text-lg font-extrabold text-teal-300">{mealPlan?.totalProteinG || 125}g</span>
        </div>
      </div>

      {/* Slot Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {slots.map((slot) => {
          const isSelected = selectedSlotFilter === slot;
          return (
            <button
              key={slot}
              onClick={() => setSelectedSlotFilter(slot)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {slot.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Grouped Meal Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const food = item.food;
          const isDone = item.isCompleted;

          return (
            <div
              key={item._id}
              className={`bg-slate-800/90 border rounded-2xl p-4 space-y-3 shadow-lg transition-all ${
                isDone ? 'border-emerald-500/40 bg-slate-800/50' : 'border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  {item.mealType.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Score: {item.score || 94}%</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <img
                  src={food?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                  alt={food?.name}
                  onClick={() => food && onSelectFood(food._id)}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-700 cursor-pointer shadow-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() => food && onSelectFood(food._id)}
                    className="text-base font-bold text-white truncate cursor-pointer hover:text-emerald-400 flex items-center justify-between"
                  >
                    <span>{food?.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-2">Portion: {item.quantityG}g serving</p>

                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50">
                      <span className="text-[9px] text-slate-400 block font-semibold">Calories</span>
                      <span className="text-xs font-bold text-white">{item.calories} kcal</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50">
                      <span className="text-[9px] text-slate-400 block font-semibold">Protein</span>
                      <span className="text-xs font-bold text-emerald-400">{item.proteinG}g</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50">
                      <span className="text-[9px] text-slate-400 block font-semibold">Carbs</span>
                      <span className="text-xs font-bold text-amber-300">{item.carbsG}g</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasons Badge */}
              {item.reasons && item.reasons.length > 0 && (
                <div className="bg-slate-900/80 p-2.5 rounded-xl text-[11px] text-slate-300 border border-slate-700/50 space-y-1">
                  <div className="font-semibold text-emerald-400 flex items-center space-x-1">
                    <Info className="w-3 h-3" />
                    <span>Why Recommended:</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">{item.reasons[0]}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => onToggleItem(item._id, !!item.isCompleted)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isDone ? 'Completed' : 'Mark Completed'}</span>
                </button>
                <button
                  onClick={() => setReplacingItem(item)}
                  className="bg-slate-700 hover:bg-slate-600 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-400 flex items-center space-x-1 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>
                <button
                  onClick={() => food && onSelectFood(food._id)}
                  className="bg-slate-700 hover:bg-slate-600 p-2.5 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FEATURE B & C: Replace Meal Interactive Modal */}
      <ReplaceMealModal
        item={replacingItem}
        isOpen={!!replacingItem}
        onClose={() => setReplacingItem(null)}
        onSuccess={onRefreshPlan}
      />
    </div>
  );
};
