import React, { useState } from 'react';
import { X, ChefHat, Sparkles, CheckCircle2, RefreshCw, Plus, Minus } from 'lucide-react';
import { recommendationApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CookFromKitchenModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const pantryOptions = [
    'Rice',
    'Dal',
    'Paneer',
    'Curd',
    'Eggs',
    'Chicken',
    'Onion',
    'Tomato',
    'Sprouts',
    'Poha',
    'Atta / Wheat',
    'Potato',
  ];

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(['Rice', 'Dal', 'Curd']);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleIngredient = (item: string) => {
    if (selectedIngredients.includes(item)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== item));
    } else {
      setSelectedIngredients([...selectedIngredients, item]);
    }
  };

  const handleGenerateRecipes = async () => {
    if (selectedIngredients.length === 0) {
      setErrorMsg('Please select at least 1 ingredient from your kitchen.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await recommendationApi.cookFromKitchen(selectedIngredients);
      if (res.success && res.data?.matchedRecipes) {
        setRecipes(res.data.matchedRecipes);
      }
    } catch (err: any) {
      console.error('Cook from kitchen error:', err);
      setErrorMsg('Failed to generate recipes. Please try again.');
    } finally {
      setLoading(false);
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
              <ChefHat className="w-5 h-5 text-emerald-400" />
              <span>Cook From My Kitchen</span>
            </h3>
            <p className="text-xs text-slate-400">Match pantry ingredients with regional diet targets</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ingredient Multi-Select Grid */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-bold block">Select Available Pantry Ingredients</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
            {pantryOptions.map((ing) => {
              const isSelected = selectedIngredients.includes(ing);
              return (
                <button
                  key={ing}
                  type="button"
                  onClick={() => toggleIngredient(ing)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-left truncate flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="truncate">{ing}</span>
                  {isSelected ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 ml-1" /> : <Plus className="w-3 h-3 shrink-0 ml-1 opacity-50" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleGenerateRecipes}
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-md transition-all mt-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Find Kitchen Recipes ({selectedIngredients.length} Selected)</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* Recipe Results */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {recipes.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Matching Regional Recipes</span>
              {recipes.map((rec, idx) => (
                <div key={idx} className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rec.food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                      alt={rec.recipeName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{rec.recipeName}</h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-300 font-semibold mt-0.5">
                        <span className="text-amber-400">{rec.calories} kcal</span>
                        <span>•</span>
                        <span className="text-emerald-400">{rec.proteinG}g Protein</span>
                        <span>•</span>
                        <span className="text-slate-400">Est. ₹{rec.estimatedCostRs}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-2 rounded-xl text-[10px] text-slate-300 space-y-1">
                    <p className="text-emerald-400 font-bold">✓ Uses: {rec.matchedIngredients.join(', ')}</p>
                    {rec.reasons?.map((r: string, rIdx: number) => (
                      <p key={rIdx} className="text-slate-400">{r}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
