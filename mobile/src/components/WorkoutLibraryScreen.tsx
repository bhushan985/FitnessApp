import React, { useState } from 'react';
import { Search, Flame, Zap, Shield, Target, Home, Sparkles, ChevronRight, Dumbbell } from 'lucide-react';

interface Props {
  onSelectCategory: (categoryTitle: string, tagFilter?: string) => void;
}

export const WorkoutLibraryScreen: React.FC<Props> = ({ onSelectCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Dumbbell className="w-5 h-5 text-[#00D084]" />
            <span>Workout Library</span>
          </h1>
          <p className="text-xs text-[#9AA8BA] mt-0.5">Explore routines by goal, duration & body area</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#9AA8BA] absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search workouts e.g., 'Lower Body', 'Fat Loss'..."
          className="w-full bg-[#0D1728] border border-[#1F2F4A] rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-[#9AA8BA] focus:outline-none focus:border-[#00D084] transition"
        />
      </div>

      {/* SECTION 1: QUICK WORKOUTS */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider">Quick Workouts</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSelectCategory('15 Min Quick Workouts', 'quick_15')}
            className="bg-[#0D1728] border border-[#1F2F4A] hover:border-[#00D084]/50 p-4 rounded-2xl text-left transition group space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-[#00D084]/20 text-[#00D084] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00D084] transition-colors">15 Min Workouts</h3>
              <p className="text-[10px] text-[#9AA8BA] mt-0.5">Short & Effective</p>
            </div>
          </button>

          <button
            onClick={() => onSelectCategory('15–30 Min Workouts', 'quick_30')}
            className="bg-[#0D1728] border border-[#1F2F4A] hover:border-[#00D084]/50 p-4 rounded-2xl text-left transition group space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-[#00D084]/20 text-[#00D084] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00D084] transition-colors">15–30 Min Workouts</h3>
              <p className="text-[10px] text-[#9AA8BA] mt-0.5">Balanced Sessions</p>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: BY GOAL */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider">By Goal</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { title: 'Fat Loss', subtitle: 'Burn Calories', icon: Flame, color: 'text-amber-400', key: 'fat_loss' },
            { title: 'Muscle Gain', subtitle: 'Build Strength', icon: Target, color: 'text-[#00D084]', key: 'muscle_gain' },
            { title: 'Strength', subtitle: 'Build Power', icon: Shield, color: 'text-blue-400', key: 'strength' },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectCategory(`${item.title} Workouts`, item.key)}
                className="bg-[#0D1728] border border-[#1F2F4A] hover:border-[#00D084]/50 p-3.5 rounded-2xl text-left transition group flex flex-col justify-between space-y-2"
              >
                <IconComp className={`w-5 h-5 ${item.color}`} />
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-[#00D084]">{item.title}</h3>
                  <p className="text-[9px] text-[#9AA8BA] mt-0.5">{item.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: BY BODY AREA */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider">By Body Area</h2>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
          {['Full Body', 'Chest', 'Back', 'Legs', 'Core'].map((area) => (
            <button
              key={area}
              onClick={() => onSelectCategory(`${area} Workouts`, area.toLowerCase())}
              className="px-4 py-2.5 bg-[#0D1728] border border-[#1F2F4A] hover:border-[#00D084] rounded-2xl text-xs font-bold text-white whitespace-nowrap transition"
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 4: WORKOUT @ HOME */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider">Workout @ Home</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSelectCategory('Cardio @ Home', 'home_cardio')}
            className="bg-[#0D1728] border border-[#1F2F4A] hover:border-[#00D084]/50 p-4 rounded-2xl text-left transition group flex items-center space-x-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#152238] border border-[#233757] flex items-center justify-center text-[#00D084]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-[#00D084]">Cardio @ Home</h3>
              <p className="text-[9px] text-[#9AA8BA]">No Equipment</p>
            </div>
          </button>

          <button
            onClick={() => onSelectCategory('Home Strength', 'home_strength')}
            className="bg-[#0D1728] border border-[#1F2F4A] hover:border-[#00D084]/50 p-4 rounded-2xl text-left transition group flex items-center space-x-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#152238] border border-[#233757] flex items-center justify-center text-[#00D084]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-[#00D084]">Strength Training</h3>
              <p className="text-[9px] text-[#9AA8BA]">Dumbbells, Bands</p>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 5: FAT BURNER */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider">Fat Burner</h2>
        <button
          onClick={() => onSelectCategory('HIIT Fat Burner Workouts', 'hiit_burner')}
          className="w-full bg-gradient-to-r from-[#0D1728] via-[#162740] to-[#0D1728] border border-[#1F2F4A] hover:border-[#00D084]/60 p-5 rounded-3xl text-left transition group flex items-center justify-between shadow-xl"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              High Burn Rate
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-[#00D084] transition-colors">HIIT Workouts</h3>
            <p className="text-xs text-[#9AA8BA]">High Intensity Interval Training to maximize post-exercise calorie burn.</p>
          </div>
          <ChevronRight className="w-6 h-6 text-[#00D084] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
