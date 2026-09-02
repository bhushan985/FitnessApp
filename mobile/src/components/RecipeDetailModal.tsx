import React, { useState } from 'react';
import { X, Star, Utensils, Flame, CheckCircle2, Loader2, Plus, Users, ChefHat } from 'lucide-react';
import { recipeApi } from '../services/api';

interface Props {
  recipe: any | null;
  isOpen: boolean;
  onClose: () => void;
  onLoggedSuccess: () => void;
}

export const RecipeDetailModal: React.FC<Props> = ({ recipe, isOpen, onClose, onLoggedSuccess }) => {
  const [servings, setServings] = useState<number>(recipe?.servings || 1);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [logging, setLogging] = useState(false);
  const [loggedMessage, setLoggedMessage] = useState<string | null>(null);

  if (!isOpen || !recipe) return null;

  const baseServings = recipe.servings || 1;
  const ratio = servings / baseServings;

  const scaledNutrition = {
    calories: Math.round((recipe.nutritionPerServing?.calories || 400) * servings),
    protein: Math.round((recipe.nutritionPerServing?.protein || 20) * servings * 10) / 10,
    carbohydrates: Math.round((recipe.nutritionPerServing?.carbohydrates || 50) * servings * 10) / 10,
    fat: Math.round((recipe.nutritionPerServing?.fat || 12) * servings * 10) / 10,
    fiber: Math.round((recipe.nutritionPerServing?.fiber || 4) * servings * 10) / 10,
  };

  const handleLogRecipe = async () => {
    try {
      setLogging(true);
      const res = await recipeApi.logRecipe(recipe._id, {
        servings,
        mealType,
      });

      if (res.success) {
        setLoggedMessage(`✓ Added ${servings} serving of ${recipe.name} (${scaledNutrition.calories} kcal) to ${mealType}`);
        onLoggedSuccess();
        setTimeout(() => {
          setLoggedMessage(null);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed logging recipe:', err);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white truncate">{recipe.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipe Header Image Banner */}
        <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-700/80">
          <img
            src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              {recipe.cuisine || 'Regional Indian'} • {recipe.dietaryType || 'Veg'}
            </span>
            <div className="flex items-center space-x-1 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{recipe.rating || 4.8}</span>
            </div>
          </div>
        </div>

        {/* Serving Scaler */}
        <div className="bg-slate-800/90 border border-slate-700 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Recipe Servings Scaler</span>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
            <button
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="w-7 h-7 rounded-lg bg-slate-800 text-white font-black text-sm flex items-center justify-center hover:bg-slate-700"
            >
              -
            </button>
            <span className="text-xs font-black text-emerald-400 min-w-[20px] text-center">{servings}</span>
            <button
              onClick={() => setServings((s) => s + 1)}
              className="w-7 h-7 rounded-lg bg-slate-800 text-white font-black text-sm flex items-center justify-center hover:bg-slate-700"
            >
              +
            </button>
          </div>
        </div>

        {/* Scaled Macro Cards */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-semibold">Calories</span>
            <span className="text-sm font-black text-emerald-400">{scaledNutrition.calories}</span>
            <span className="text-[8px] text-slate-500 block">kcal</span>
          </div>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-semibold">Protein</span>
            <span className="text-sm font-black text-white">{scaledNutrition.protein}g</span>
            <span className="text-[8px] text-slate-500 block">grams</span>
          </div>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-semibold">Carbs</span>
            <span className="text-sm font-black text-white">{scaledNutrition.carbohydrates}g</span>
            <span className="text-[8px] text-slate-500 block">grams</span>
          </div>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-semibold">Fat</span>
            <span className="text-sm font-black text-white">{scaledNutrition.fat}g</span>
            <span className="text-[8px] text-slate-500 block">grams</span>
          </div>
        </div>

        {/* Ingredients List */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Ingredients ({recipe.ingredients?.length || 0})</h4>
          <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl space-y-1.5">
            {recipe.ingredients?.map((ing: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-700/40 last:border-0">
                <span className="text-slate-300 font-medium">{ing.item}</span>
                <span className="text-emerald-400 font-bold">
                  {Math.round(ing.amount * ratio * 10) / 10} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Preparation Instructions</h4>
          <div className="space-y-2">
            {recipe.instructions?.map((step: string, idx: number) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl flex space-x-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-slate-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Alert */}
        {loggedMessage && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center space-x-2 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{loggedMessage}</span>
          </div>
        )}

        {/* Log Recipe to Consumed Tracker */}
        <div className="pt-2">
          <button
            onClick={handleLogRecipe}
            disabled={logging}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {logging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Add to Today's Consumed Food ({scaledNutrition.calories} kcal)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
