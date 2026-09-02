import { useState } from 'react';
import { Leaf, Egg, Utensils, AlertTriangle, Check, ChevronRight } from 'lucide-react';

interface Props {
  dietType: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  onChangeDietType: (type: 'veg' | 'non_veg' | 'eggetarian' | 'vegan') => void;
  foodPreferences: string[];
  onChangeFoodPreferences: (prefs: string[]) => void;
  allergies: string[];
  onChangeAllergies: (allergies: string[]) => void;
  onNext: () => void;
}

const PREFERENCE_OPTIONS = ['Rice', 'Roti', 'Dal', 'Paneer', 'Chicken', 'Fish', 'Sprouts', 'Oats', 'Fruits', 'Milk/Dairy'];
const ALLERGY_OPTIONS = ['Peanuts', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Shellfish', 'Tree Nuts'];

export const PreferencesScreen: React.FC<Props> = ({
  dietType,
  onChangeDietType,
  foodPreferences,
  onChangeFoodPreferences,
  allergies,
  onChangeAllergies,
  onNext,
}) => {
  const togglePref = (item: string) => {
    if (foodPreferences.includes(item)) {
      onChangeFoodPreferences(foodPreferences.filter((i) => i !== item));
    } else {
      onChangeFoodPreferences([...foodPreferences, item]);
    }
  };

  const toggleAllergy = (item: string) => {
    if (allergies.includes(item)) {
      onChangeAllergies(allergies.filter((i) => i !== item));
    } else {
      onChangeAllergies([...allergies, item]);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-900 text-white justify-between overflow-y-auto">
      <div>
        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold mb-1 uppercase tracking-wider">
          <span>Step 2 of 3</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Your Preferences</h2>
        <p className="text-xs text-slate-400 mb-6">
          Diet type and allergy exclusions dynamically shape your regional meal recommendations.
        </p>

        {/* Diet Type Selector */}
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dietary Type</h3>
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {[
            { id: 'veg', label: 'Vegetarian', icon: Leaf, color: 'text-emerald-400' },
            { id: 'eggetarian', label: 'Eggetarian', icon: Egg, color: 'text-amber-400' },
            { id: 'non_veg', label: 'Non-Veg', icon: Utensils, color: 'text-rose-400' },
          ].map((item) => {
            const isSelected = dietType === item.id;
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onChangeDietType(item.id as any)}
                className={`p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Favorite Ingredients */}
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Food Preferences</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {PREFERENCE_OPTIONS.map((item) => {
            const isSelected = foodPreferences.includes(item);
            return (
              <button
                key={item}
                onClick={() => togglePref(item)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{item}</span>
              </button>
            );
          })}
        </div>

        {/* Allergies Checklist */}
        <div className="flex items-center space-x-1.5 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allergies (Strict Filter)</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {ALLERGY_OPTIONS.map((item) => {
            const isSelected = allergies.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleAllergy(item)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-base transition-all active:scale-[0.98] mt-4"
      >
        <span>Set Fitness Goals</span>
        <ChevronRight className="w-5 h-5 stroke-[3]" />
      </button>
    </div>
  );
};
