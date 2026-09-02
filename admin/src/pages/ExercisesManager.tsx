import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, Search, Flame, Clock, Loader2 } from 'lucide-react';
import { adminApi } from '../services/api';

export const ExercisesManager: React.FC = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getExercises();
      if (res.success && res.data) setExercises(res.data);
    } catch (err) {
      console.error('Failed loading exercise database:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.equipment.toLowerCase().includes(search.toLowerCase()) ||
    ex.primaryMuscle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Exercise Library Manager</h1>
          <p className="text-xs text-slate-400 mt-1">Manage exercise media, step-by-step instructions, sets & calorie burn formulas</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search exercise, muscle group, or equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500"
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
          <p className="text-xs">Loading exercise library database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((ex) => (
            <div key={ex._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3">
              <div className="h-40 bg-slate-950 relative">
                <img
                  src={ex.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80'}
                  alt={ex.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase">
                  {ex.difficulty}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-base font-extrabold text-white">{ex.name}</h3>
                <p className="text-xs text-slate-300 line-clamp-2">{ex.description}</p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="text-emerald-400 font-semibold">{ex.sets} × {ex.reps} Reps</span>
                  <span>{ex.equipment}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
