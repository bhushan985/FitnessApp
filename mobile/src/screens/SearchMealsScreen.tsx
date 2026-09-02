import React, { useState, useEffect } from 'react';
import { Search, Filter, ChefHat, Flame, Plus, Star, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { recipeApi, foodLogApi } from '../services/api';
import { RecipeDetailModal } from '../components/RecipeDetailModal';

interface Props {
  onBack?: () => void;
  onLoggedSuccess?: () => void;
}

export const SearchMealsScreen: React.FC<Props> = ({ onBack, onLoggedSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Selected Recipe Modal
  const [activeRecipe, setActiveRecipe] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const regionalCuisines = [
    'all',
    'Maharashtrian',
    'South Indian',
    'North Indian',
    'Hyderabadi',
    'Punjabi',
    'Gujarati',
    'Bengali',
  ];

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await recipeApi.searchRecipes({
        search: searchQuery,
        dietaryType: selectedDiet !== 'all' ? selectedDiet : undefined,
        region: selectedRegion !== 'all' ? selectedRegion : undefined,
      });

      if (res.success && res.data) {
        setRecipes(res.data);
      }
    } catch (err) {
      console.error('Failed fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [selectedDiet, selectedRegion]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecipes();
  };

  // Quick Direct Log
  const handleQuickLog = async (recipe: any) => {
    try {
      await recipeApi.logRecipe(recipe._id, { servings: 1, mealType: 'lunch' });
      if (onLoggedSuccess) onLoggedSuccess();
    } catch (err) {
      console.error('Failed quick logging recipe:', err);
    }
  };

  return (
    <div className="flex-1 bg-slate-900 text-white overflow-y-auto pb-24 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <ChefHat className="w-5 h-5 text-emerald-400" />
              <span>Search Meals & Recipes</span>
            </h2>
            <p className="text-xs text-slate-400">Discover regional Indian dishes & log directly</p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Search e.g. 'high protein breakfast', 'maharashtrian food', 'biryani'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
      </form>

      {/* Filter Chips */}
      <div className="space-y-3">
        {/* Dietary Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Diets' },
            { id: 'veg', label: 'Vegetarian' },
            { id: 'non_veg', label: 'Non-Veg' },
            { id: 'eggetarian', label: 'Eggetarian' },
            { id: 'vegan', label: 'Vegan' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDiet(d.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold shrink-0 border transition ${
                selectedDiet === d.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Regional Cuisine Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {regionalCuisines.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedRegion(c)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 border transition capitalize ${
                selectedRegion === c
                  ? 'bg-teal-500 text-slate-950 border-teal-400'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-white'
              }`}
            >
              {c === 'all' ? 'All Regions' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center space-y-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          <span className="text-xs">Searching recipes database...</span>
        </div>
      )}

      {/* Search Result Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 gap-4">
          {recipes.map((r) => (
            <div
              key={r._id}
              className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden"
            >
              <div className="flex space-x-3">
                {/* Image */}
                <img
                  src={r.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                  alt={r.name}
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-700 shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-md uppercase">
                      {r.cuisine || 'Regional'}
                    </span>
                    <div className="flex items-center space-x-1 text-[10px] text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{r.rating || 4.8}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-white truncate">{r.name}</h3>

                  <div className="flex items-center space-x-3 text-xs font-bold text-slate-300 pt-0.5">
                    <span className="text-emerald-400">{r.nutritionPerServing?.calories || 400} kcal</span>
                    <span>{r.nutritionPerServing?.protein || 20}g Protein</span>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Serving: {r.servingOptions?.[0]?.grams || 300}g ({r.servings || 1} serving)
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/50">
                <button
                  onClick={() => {
                    setActiveRecipe(r);
                    setModalOpen(true);
                  }}
                  className="py-2.5 bg-slate-700/90 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>View Recipe</span>
                </button>

                <button
                  onClick={() => handleQuickLog(r)}
                  className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Food</span>
                </button>
              </div>
            </div>
          ))}

          {recipes.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-800/40 rounded-3xl border border-slate-800 p-5">
              <ChefHat className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No regional recipes found matching criteria</p>
              <p className="text-[11px] text-slate-500">Try searching for Poha, Biryani, Roti, Paneer, or reset filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={activeRecipe}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLoggedSuccess={() => {
          if (onLoggedSuccess) onLoggedSuccess();
        }}
      />
    </div>
  );
};
