import React, { useState, useEffect } from 'react';
import { Activity, Play, Square, Footprints, Flame, Clock, Award } from 'lucide-react';
import { workoutApi } from '../services/api';

interface Props {
  onActivityLogged?: () => void;
}

export const ActivityTrackerScreen: React.FC<Props> = ({ onActivityLogged }) => {
  const [activeType, setActiveType] = useState<'walking' | 'running' | 'cycling' | 'swimming'>('walking');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTracking) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const nextSec = prev + 1;
          // Estimate distance & calories dynamically based on activity type & intensity
          const multiplier = intensity === 'high' ? 1.4 : intensity === 'low' ? 0.8 : 1.0;
          let speedKmPerSec = 0.0014; // default walking (~5 km/h)
          let calPerSec = 0.08;

          if (activeType === 'running') {
            speedKmPerSec = 0.0028; // ~10 km/h
            calPerSec = 0.18;
          } else if (activeType === 'cycling') {
            speedKmPerSec = 0.0055; // ~20 km/h
            calPerSec = 0.15;
          } else if (activeType === 'swimming') {
            speedKmPerSec = 0.0008;
            calPerSec = 0.14;
          }

          setDistanceKm((d) => d + speedKmPerSec * multiplier);
          setCaloriesBurned((c) => c + calPerSec * multiplier);

          return nextSec;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTracking, activeType, intensity]);

  const handleStart = () => {
    setIsTracking(true);
  };

  const handleStopAndSave = async () => {
    setIsTracking(false);
    try {
      setSaving(true);
      const mins = Math.max(1, Math.round(seconds / 60));
      await workoutApi.logActivity({
        type: activeType,
        intensity,
        durationMinutes: mins,
        distanceKm: Number(distanceKm.toFixed(2)),
        caloriesBurned: Math.round(caloriesBurned),
      });

      if (onActivityLogged) onActivityLogged();
    } catch (err) {
      console.error('Activity log error:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-6 animate-fadeIn font-['Inter',sans-serif]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#00D084]" />
          <span>Activity Tracking</span>
        </h1>
        <p className="text-xs text-[#9AA8BA] mt-0.5">Real-time GPS & cardio activity monitor</p>
      </div>

      {/* Activity Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-[#0D1728] border border-[#1F2F4A] p-1.5 rounded-2xl text-center">
        {[
          { id: 'walking', label: 'Walking' },
          { id: 'running', label: 'Running' },
          { id: 'cycling', label: 'Cycling' },
          { id: 'swimming', label: 'Swimming' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (!isTracking) {
                setActiveType(tab.id as any);
                setSeconds(0);
                setDistanceKm(0);
                setCaloriesBurned(0);
              }
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all capitalize ${
              activeType === tab.id
                ? 'bg-[#00D084] text-[#030B16] shadow-md shadow-[#00D084]/20'
                : 'text-[#9AA8BA] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Tracker View Card */}
      <div className="bg-[#0D1728] border border-[#1F2F4A] rounded-3xl p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
        {/* Distance Main Counter */}
        <div className="space-y-1">
          <div className="text-5xl font-black text-white tracking-tight">
            {distanceKm.toFixed(2)}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#00D084]">KM DISTANCE</div>
        </div>

        {/* Intensity Selector */}
        <div className="inline-flex items-center space-x-2 bg-[#152238] border border-[#203350] px-3.5 py-1.5 rounded-full">
          <span className="text-[11px] text-[#9AA8BA] font-semibold">Intensity:</span>
          {(['low', 'moderate', 'high'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setIntensity(lvl)}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold capitalize transition ${
                intensity === lvl ? 'bg-[#00D084] text-[#030B16]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-[#152238] border border-[#203350] p-3 rounded-2xl">
            <Clock className="w-4 h-4 text-[#00D084] mx-auto mb-1" />
            <span className="text-[10px] text-[#9AA8BA] font-semibold block">Time</span>
            <span className="text-sm font-extrabold text-white">{formatTime(seconds)}</span>
          </div>

          <div className="bg-[#152238] border border-[#203350] p-3 rounded-2xl">
            <Footprints className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <span className="text-[10px] text-[#9AA8BA] font-semibold block">Distance</span>
            <span className="text-sm font-extrabold text-white">{distanceKm.toFixed(2)} km</span>
          </div>

          <div className="bg-[#152238] border border-[#203350] p-3 rounded-2xl">
            <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] text-[#9AA8BA] font-semibold block">Calories</span>
            <span className="text-sm font-extrabold text-amber-300">{Math.round(caloriesBurned)} kcal</span>
          </div>
        </div>

        {/* Start / Stop CTA */}
        <div className="pt-2">
          {!isTracking ? (
            <button
              onClick={handleStart}
              className="w-full py-4 bg-[#00D084] hover:bg-[#00C98A] text-[#030B16] font-extrabold text-sm rounded-2xl shadow-xl shadow-[#00D084]/25 flex items-center justify-center space-x-2 transition active:scale-[0.98]"
            >
              <span>Start Tracking</span>
              <Play className="w-4 h-4 fill-current stroke-none" />
            </button>
          ) : (
            <button
              onClick={handleStopAndSave}
              disabled={saving}
              className="w-full py-4 bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-rose-500/25 flex items-center justify-center space-x-2 transition active:scale-[0.98]"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>{saving ? 'Saving Activity...' : 'Stop & Save Activity'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
