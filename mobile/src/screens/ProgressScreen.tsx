import React, { useState, useEffect } from 'react';
import { TrendingDown, Flame, Dumbbell, Award, Scale, ChevronRight } from 'lucide-react';
import { progressApi } from '../services/api';
import { ProgressAnalytics } from '../types';

export const ProgressScreen: React.FC = () => {
  const [timeframe, setTimeframe] = useState<number>(7);
  const [data, setData] = useState<ProgressAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState<string>('');
  const [loggingWeight, setLoggingWeight] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await progressApi.getAnalytics(timeframe);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load progress analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    try {
      setLoggingWeight(true);
      await progressApi.logWeight(parseFloat(newWeight));
      setNewWeight('');
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to log weight:', err);
    } finally {
      setLoggingWeight(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex-1 bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading progress analytics...</p>
        </div>
      </div>
    );
  }

  const { currentWeight, targetWeight, goalProgressPct, chartData } = data;

  return (
    <div className="flex-1 bg-slate-900 text-white overflow-y-auto pb-24 p-5 space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Progress Dashboard</h2>
          <p className="text-xs text-slate-400">Track weight trend & macro adherence</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                timeframe === days ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {days === 7 ? '7D' : days === 30 ? '30D' : '3M'}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Summary Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-800 to-slate-800 border border-emerald-500/30 p-4 rounded-2xl space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Current Weight</span>
              <span className="text-lg font-extrabold text-white">{currentWeight} kg</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold block">Target Weight</span>
            <span className="text-lg font-extrabold text-emerald-400">{targetWeight} kg</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">Goal Progress</span>
            <span className="text-emerald-400">{goalProgressPct}% Completed</span>
          </div>
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full rounded-full transition-all"
              style={{ width: `${Math.max(10, goalProgressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weight Trend Chart Visualizer */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Weight Trend (kg)</h3>
          <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-1.2 kg this week</span>
          </span>
        </div>

        {/* Visual Bar/Line Chart Representation */}
        <div className="h-32 flex items-end justify-between space-x-2 pt-4 border-b border-slate-700/60 pb-2">
          {chartData.map((item, idx) => {
            const minW = Math.min(...chartData.map((d) => d.weightKg));
            const maxW = Math.max(...chartData.map((d) => d.weightKg)) || minW + 1;
            const heightPct = Math.max(25, Math.min(100, ((item.weightKg - minW + 1) / (maxW - minW + 2)) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center space-y-1 group">
                <span className="text-[9px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.weightKg}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all group-hover:from-emerald-500 group-hover:to-teal-300"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[9px] text-slate-400 truncate">{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Calories Intake Chart */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Daily Calorie Intake (kcal)</h3>
          <span className="text-xs text-amber-400 font-semibold">Target: {data.dailyCalorieTarget} kcal</span>
        </div>

        <div className="h-28 flex items-end justify-between space-x-2 pt-2">
          {chartData.map((item, idx) => {
            const calPct = Math.min(100, Math.round((item.calories / (data.dailyCalorieTarget || 2000)) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center space-y-1">
                <div
                  className="w-full bg-amber-500/80 hover:bg-amber-400 rounded-t-lg transition-all"
                  style={{ height: `${Math.max(20, calPct)}%` }}
                />
                <span className="text-[9px] text-slate-400 truncate">{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Today's Weight Form */}
      <form onSubmit={handleLogWeightSubmit} className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center space-x-3">
        <div className="flex-1">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Log Today's Weight</label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 76.5"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={loggingWeight || !newWeight}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs mt-4 transition-all"
        >
          {loggingWeight ? 'Saving...' : 'Save Log'}
        </button>
      </form>
    </div>
  );
};
