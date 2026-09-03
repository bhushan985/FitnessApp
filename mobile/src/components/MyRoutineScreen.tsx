import React, { useState } from 'react';
import { Calendar, Check, Plus, Sparkles, Clock, Flame, Dumbbell } from 'lucide-react';

interface Props {
  onStartWorkoutForDay: (dayName: string) => void;
  onCreatePersonalRoutine: () => void;
}

export const MyRoutineScreen: React.FC<Props> = ({
  onStartWorkoutForDay,
  onCreatePersonalRoutine,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('mon');

  const weekDays = [
    { key: 'mon', name: 'Mon', dayNum: '1', completed: true },
    { key: 'tue', name: 'Tue', dayNum: '2', completed: true },
    { key: 'wed', name: 'Wed', dayNum: '3', completed: true },
    { key: 'thu', name: 'Thu', dayNum: '4', completed: false, isToday: true },
    { key: 'fri', name: 'Fri', dayNum: '5', completed: false },
    { key: 'sat', name: 'Sat', dayNum: '6', completed: false },
    { key: 'sun', name: 'Sun', dayNum: '7', completed: false },
  ];

  const weeklySchedule = [
    {
      day: 'Mon',
      dayKey: 'monday',
      title: 'Lower Body Strength',
      duration: '32 min',
      calories: '210 kcal',
      completed: true,
      equipment: 'Dumbbells',
    },
    {
      day: 'Wed',
      dayKey: 'wednesday',
      title: 'Upper Body Push',
      duration: '28 min',
      calories: '180 kcal',
      completed: true,
      equipment: 'Barbell & Bench',
    },
    {
      day: 'Fri',
      dayKey: 'friday',
      title: 'HIIT Cardio',
      duration: '20 min',
      calories: '160 kcal',
      completed: false,
      equipment: 'Bodyweight',
    },
    {
      day: 'Sun',
      dayKey: 'sunday',
      title: 'Full Body Mobility',
      duration: '15 min',
      calories: '90 kcal',
      completed: false,
      equipment: 'Mat / Bands',
    },
  ];

  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-[#00D084]" />
          <span>My Routine</span>
        </h1>
        <p className="text-xs text-[#9AA8BA] mt-0.5">Your structured weekly training schedule</p>
      </div>

      {/* Weekly Day Selector */}
      <div className="bg-[#0D1728] border border-[#1A2A42] p-3 rounded-2xl">
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {weekDays.map((d) => {
            const isSelected = selectedDay === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setSelectedDay(d.key)}
                className={`py-2.5 px-1 rounded-xl flex flex-col items-center justify-center space-y-1 transition-all ${
                  isSelected
                    ? 'bg-[#00D084] text-[#030B16] font-extrabold shadow-lg shadow-[#00D084]/20 scale-105'
                    : 'bg-[#152238] text-[#9AA8BA] hover:text-white border border-[#203350]'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider">{d.name}</span>
                {d.completed ? (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#030B16] text-[#00D084]' : 'bg-[#00D084]/20 text-[#00D084]'}`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <span className={`text-xs font-bold ${isSelected ? 'text-[#030B16]' : 'text-slate-300'}`}>{d.dayNum}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* This Week's Plan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#9AA8BA] uppercase tracking-wider">This Week's Plan</h2>
          <span className="text-[11px] font-semibold text-[#00D084]">4 Days Scheduled</span>
        </div>

        <div className="space-y-2.5">
          {weeklySchedule.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                item.completed
                  ? 'bg-[#0D1728]/70 border-[#00D084]/40'
                  : 'bg-[#0D1728] border-[#1A2A42] hover:border-[#253A5A]'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                    item.completed
                      ? 'bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30'
                      : 'bg-[#152238] text-slate-300 border border-[#203350]'
                  }`}
                >
                  {item.day}
                </div>

                <div>
                  <h3 className={`text-sm font-bold ${item.completed ? 'text-white' : 'text-white'}`}>
                    {item.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-[11px] text-[#9AA8BA] mt-0.5">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#00D084]" />
                      <span>{item.duration}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{item.calories}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {item.completed ? (
                  <div className="w-7 h-7 rounded-full bg-[#00D084]/20 border border-[#00D084]/40 text-[#00D084] flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <button
                    onClick={() => onStartWorkoutForDay(item.dayKey)}
                    className="px-3.5 py-1.5 bg-[#00D084] hover:bg-[#00C98A] text-[#030B16] font-bold text-xs rounded-xl shadow"
                  >
                    Start
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Workout Day */}
        <button
          onClick={onCreatePersonalRoutine}
          className="w-full py-3 bg-[#0D1728] hover:bg-[#152238] border border-dashed border-[#243754] text-[#00D084] font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Workout Day</span>
        </button>
      </div>

      {/* Create Personal Routine AI Card */}
      <div className="relative bg-gradient-to-br from-[#0D1728] via-[#122036] to-[#0A1626] border border-[#1F314D] rounded-3xl p-5 shadow-xl overflow-hidden">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00D084]/20 border border-[#00D084]/30 flex items-center justify-center flex-shrink-0 text-[#00D084]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold text-white">Create Personal Routine</h3>
            <p className="text-xs text-[#9AA8BA]">Let AI build the perfect plan for your specific fitness goal and equipment.</p>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={onCreatePersonalRoutine}
            className="w-full py-3 bg-[#00D084] hover:bg-[#00C98A] text-[#030B16] font-extrabold text-xs rounded-2xl shadow-lg shadow-[#00D084]/20 transition"
          >
            Create Now
          </button>
        </div>
      </div>
    </div>
  );
};
