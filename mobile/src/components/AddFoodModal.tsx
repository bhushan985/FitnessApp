import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Utensils, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { foodApi, foodLogApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoggedSuccess: () => void;
}

export const AddFoodModal: React.FC<Props> = ({ isOpen, onClose, onLoggedSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Selected Food State
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [customFoodName, setCustomFoodName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<'grams' | 'bowl' | 'plate' | 'piece' | 'roti' | 'cup' | 'glass' | 'tbsp' | 'tsp' | 'serving'>('grams');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout'>('lunch');
  const [logging, setLogging] = useState(false);

  // Serving Unit Gram Conversions
  const unitGramsMap: Record<string, number> = {
    grams: 1,
    bowl: 250,
    plate: 350,
    piece: 80,
    roti: 40,
    cup: 200,
    glass: 250,
    tbsp: 15,
    tsp: 5,
    serving: 300,
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const res = await foodApi.getFoods({ search: searchQuery });
        if (res.success && res.data) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error('Failed searching foods:', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const estimatedGrams = unit === 'grams' ? quantity * 100 : Math.round(quantity * (unitGramsMap[unit] || 100));

  // Compute Macros from selected food or defaults
  const baseNutrition = selectedFood?.nutrition || {
    calories: 180,
    proteinG: 8,
    carbohydratesG: 26,
    fatG: 6,
    fiberG: 2,
  };

  const scale = estimatedGrams / 100;
  const calculatedCal = Math.round((baseNutrition.calories || 150) * scale);
  const calculatedProtein = Math.round((baseNutrition.proteinG || 8) * scale * 10) / 10;
  const calculatedCarbs = Math.round((baseNutrition.carbohydratesG || 25) * scale * 10) / 10;
  const calculatedFat = Math.round((baseNutrition.fatG || 5) * scale * 10) / 10;
  const calculatedFiber = Math.round((baseNutrition.fiberG || 2) * scale * 10) / 10;

  const handleConfirmLog = async () => {
    const foodName = selectedFood ? selectedFood.name : customFoodName.trim();
    if (!foodName) return;

    try {
      setLogging(true);
      await foodLogApi.logFood({
        mealType,
        foodId: selectedFood?._id,
        foodName,
        quantity,
        unit,
        grams: estimatedGrams,
        nutrition: {
          calories: calculatedCal,
          protein: calculatedProtein,
          carbohydrates: calculatedCarbs,
          fat: calculatedFat,
          fiber: calculatedFiber,
        },
        source: { type: selectedFood ? 'search' : 'manual' },
      });

      onLoggedSuccess();
      onClose();
    } catch (err) {
      console.error('Failed logging food:', err);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>Add Food to Daily Tracker</span>
            </h3>
            <p className="text-[11px] text-slate-400">Search database or enter food & practical serving units</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Food Database */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Search Food Database</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search e.g. Poha, Biryani, Roti, Dal, Egg..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {loadingSearch && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3 top-3" />}
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="max-h-40 overflow-y-auto bg-slate-800/90 border border-slate-700 rounded-xl p-1 space-y-1">
              {searchResults.map((f) => (
                <button
                  key={f._id}
                  onClick={() => {
                    setSelectedFood(f);
                    setCustomFoodName(f.name);
                    setSearchResults([]);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-700/80 transition flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-white truncate">{f.name}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">{f.nutrition?.calories || 150} kcal/100g</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Manual Food Name input if no DB match */}
        {!selectedFood && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Food Name</label>
            <input
              type="text"
              placeholder="Or type food name manually..."
              value={customFoodName}
              onChange={(e) => setCustomFoodName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* Selected Food Indicator */}
        {selectedFood && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">Selected: {selectedFood.name}</span>
            <button
              onClick={() => {
                setSelectedFood(null);
                setCustomFoodName('');
              }}
              className="text-[10px] text-slate-400 hover:text-white underline"
            >
              Change
            </button>
          </div>
        )}

        {/* Quantity & Practical Serving Unit Selection */}
        <div className="grid grid-cols-2 gap-3">
          {/* Quantity stepper */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Quantity</label>
            <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-slate-700 text-white font-black text-sm flex items-center justify-center"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full bg-transparent text-center text-xs font-bold text-white focus:outline-none"
              />
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg bg-slate-700 text-white font-black text-sm flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Unit selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Serving Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              className="w-full bg-slate-800 text-xs font-bold text-emerald-400 border border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 capitalize"
            >
              <option value="bowl">1 Bowl (≈250g)</option>
              <option value="plate">1 Plate (≈350g)</option>
              <option value="piece">1 Piece (≈80g)</option>
              <option value="roti">1 Roti (≈40g)</option>
              <option value="cup">1 Cup (≈200g)</option>
              <option value="glass">1 Glass (≈250g)</option>
              <option value="tbsp">1 Tbsp (≈15g)</option>
              <option value="serving">1 Serving (≈300g)</option>
              <option value="grams">100 Grams</option>
            </select>
          </div>
        </div>

        {/* Meal Category Selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Meal Category</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMealType(m)}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-bold capitalize transition border ${
                  mealType === m
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {m.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Nutrition Preview Badge */}
        <div className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl space-y-1 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Nutrition ({estimatedGrams}g)</span>
          <div className="flex justify-around text-xs font-black pt-1">
            <div>
              <span className="text-emerald-400 block text-sm">{calculatedCal}</span>
              <span className="text-[9px] text-slate-500 font-normal">kcal</span>
            </div>
            <div>
              <span className="text-white block text-sm">{calculatedProtein}g</span>
              <span className="text-[9px] text-slate-500 font-normal">Protein</span>
            </div>
            <div>
              <span className="text-white block text-sm">{calculatedCarbs}g</span>
              <span className="text-[9px] text-slate-500 font-normal">Carbs</span>
            </div>
            <div>
              <span className="text-white block text-sm">{calculatedFat}g</span>
              <span className="text-[9px] text-slate-500 font-normal">Fat</span>
            </div>
          </div>
        </div>

        {/* Confirm Log Button */}
        <button
          onClick={handleConfirmLog}
          disabled={logging || (!selectedFood && !customFoodName.trim())}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
        >
          {logging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>Add to Today's Food</span>
        </button>
      </div>
    </div>
  );
};
