import React, { useState, useEffect } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle2, Flame, Dumbbell, Sparkles, MapPin, Tag, Heart } from 'lucide-react';
import { foodApi, recommendationApi, mealLogApi } from '../services/api';
import { Food } from '../types';

interface Props {
  foodId: string;
  onBack: () => void;
  onLogSuccess?: () => void;
}

export const FoodDetailsScreen: React.FC<Props> = ({ foodId, onBack, onLogSuccess }) => {
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  useEffect(() => {
    fetchFoodDetails();
  }, [foodId]);

  const fetchFoodDetails = async () => {
    try {
      setLoading(true);
      const res = await foodApi.getFoodById(foodId);
      if (res.success) {
        setFood(res.data);
      }
    } catch (err) {
      console.error('Failed to load food details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (type: 'liked' | 'disliked') => {
    try {
      setFeedbackSent(type);
      await recommendationApi.submitFeedback(foodId, type, type === 'liked' ? 5 : 1);
    } catch (err) {
      console.error('Feedback failed:', err);
    }
  };

  const handleLogMeal = async () => {
    try {
      setLogging(true);
      await mealLogApi.logMeal({
        foodId,
        mealType: food?.category || 'snack',
        quantityG: food?.defaultServingSize || 100,
        source: 'recommended',
      });
      setLoggedSuccess(true);
      if (onLogSuccess) onLogSuccess();
    } catch (err) {
      console.error('Log meal failed:', err);
    } finally {
      setLogging(false);
    }
  };

  if (loading || !food) {
    return (
      <div className="flex-1 bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading food nutrition profile...</p>
        </div>
      </div>
    );
  }

  const { nutrition } = food;

  return (
    <div className="flex-1 bg-slate-900 text-white overflow-y-auto pb-24 relative">
      {/* Top Image Hero Banner */}
      <div className="relative h-64 w-full">
        <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center border border-slate-700 shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
              {food.dietaryType.replace('_', '-')}
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{food.name}</h1>
            <p className="text-xs text-slate-300">
              {food.localNames?.join(' • ') || 'Authentic Regional Recipe'}
            </p>
          </div>
          <span className="text-xs bg-slate-800/90 backdrop-blur-md border border-slate-700 text-emerald-400 font-bold px-3 py-1.5 rounded-xl">
            ₹60 avg price
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Why Recommended Section */}
        <div className="bg-gradient-to-r from-emerald-950/80 to-slate-800 border border-emerald-500/40 p-4 rounded-2xl space-y-2.5 shadow-xl">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
            <Sparkles className="w-4 h-4 fill-emerald-400" />
            <span className="uppercase tracking-wider">Why Recommended by AI</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Matches your {food.dietaryType} preference & region availability score (10/10)</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>High in protein ({nutrition.proteinG}g) supporting your goal</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero allergy conflicts with your saved profile settings</span>
            </div>
          </div>
        </div>

        {/* Nutritional Breakdown Cards */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Nutrition per {food.defaultServingSize}g</h3>
          <div className="grid grid-cols-4 gap-2.5 text-center">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl">
              <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block font-semibold">Calories</span>
              <span className="text-sm font-extrabold text-white">{nutrition.calories}</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl">
              <Dumbbell className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block font-semibold">Protein</span>
              <span className="text-sm font-extrabold text-emerald-400">{nutrition.proteinG}g</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl">
              <Tag className="w-4 h-4 text-amber-300 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block font-semibold">Carbs</span>
              <span className="text-sm font-extrabold text-white">{nutrition.carbohydratesG}g</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl">
              <Heart className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block font-semibold">Fat</span>
              <span className="text-sm font-extrabold text-white">{nutrition.fatG}g</span>
            </div>
          </div>
        </div>

        {/* Ingredients & Preparation */}
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Ingredients</h4>
            <div className="flex flex-wrap gap-1.5">
              {food.ingredients?.map((ing, i) => (
                <span key={i} className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-xl">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Preparation Method</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{food.preparationMethod}</p>
          </div>
        </div>

        {/* Feedback Loop Rating */}
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Rate This Recommendation</span>
            <span className="text-[10px] text-slate-400">Helps AI refine future meal plans</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFeedback('liked')}
              className={`p-2.5 rounded-xl border transition-all ${
                feedbackSent === 'liked'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFeedback('disliked')}
              className={`p-2.5 rounded-xl border transition-all ${
                feedbackSent === 'disliked'
                  ? 'bg-rose-500 text-white font-bold border-rose-400'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Log Meal CTA */}
        <button
          onClick={handleLogMeal}
          disabled={logging || loggedSuccess}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-base transition-all active:scale-[0.98]"
        >
          {loggedSuccess ? (
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>Meal Logged to Today's Tracker!</span>
            </span>
          ) : (
            <span>Log This Meal ({food.defaultServingSize}g)</span>
          )}
        </button>
      </div>
    </div>
  );
};
