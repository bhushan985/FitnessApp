import React, { useState, useEffect } from 'react';
import { X, Play, Shield, Dumbbell, Flame, Clock, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { exerciseApi } from '../services/api';
import { AnatomicalMuscleMap } from '../components/AnatomicalMuscleMap';


interface Props {
  exerciseId: string;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<Props> = ({ exerciseId, onClose }) => {
  const [exercise, setExercise] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      const res = await exerciseApi.getExerciseById(exerciseId);
      if (res.success && res.data) {
        setExercise(res.data);
      }
    } catch (err) {
      console.error('Failed to load exercise detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
          <p className="text-xs">Loading exercise demonstration...</p>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  const mediaUrl = exercise.media?.url || exercise.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80';
  const muscleEngagementList = exercise.muscleEngagement && exercise.muscleEngagement.length > 0
    ? exercise.muscleEngagement
    : [
        { muscle: exercise.primaryMuscle || 'Primary', percentage: 70, isPrimary: true },
        ...(exercise.secondaryMuscles || []).map((m: string) => ({ muscle: m, percentage: 30 / Math.max(1, exercise.secondaryMuscles.length), isPrimary: false })),
      ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Media Player Header */}
        <div className="relative w-full h-64 bg-slate-950 flex items-center justify-center overflow-hidden">
          {isPlayingVideo && exercise.videoUrl ? (
            <video src={exercise.videoUrl} controls autoPlay className="w-full h-full object-cover" />
          ) : (
            <>
              <img
                src={mediaUrl}
                alt={exercise.name}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

              {exercise.videoUrl && (
                <button
                  onClick={() => setIsPlayingVideo(true)}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                >
                  <Play className="w-7 h-7 fill-slate-950 ml-1" />
                </button>
              )}
            </>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-950/70 text-slate-300 hover:text-white backdrop-blur-md z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 no-scrollbar">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
              {exercise.difficulty} • {exercise.movementType}
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1.5">{exercise.name}</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{exercise.description}</p>
          </div>

          {/* Visual SVG Anatomical Muscle Map */}
          <AnatomicalMuscleMap
            primaryMuscles={exercise.primaryMuscles || [exercise.primaryMuscle]}
            secondaryMuscles={exercise.secondaryMuscles || []}
          />

          {/* Muscle Engagement Visual Bars */}
          <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl space-y-2">

            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Which muscles does this exercise target?</h3>
            <div className="space-y-2 pt-1">
              {muscleEngagementList.map((eng: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-semibold flex items-center space-x-1">
                      <span>{eng.muscle}</span>
                      {eng.isPrimary && <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold ml-1">PRIMARY</span>}
                    </span>
                    <span className="text-emerald-400 font-bold">{eng.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${eng.isPrimary ? 'bg-emerald-400' : 'bg-teal-500/60'}`}
                      style={{ width: `${eng.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-center">
              <Dumbbell className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">Equipment</p>
              <p className="text-xs font-extrabold text-white truncate mt-0.5">{exercise.equipment}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-center">
              <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">Est. Burn</p>
              <p className="text-xs font-extrabold text-white truncate mt-0.5">~{exercise.caloriesEstimate || 50} kcal</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-center">
              <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">Target Sets</p>
              <p className="text-xs font-extrabold text-white truncate mt-0.5">
                {exercise.sets || 3} × {exercise.reps || 12}
              </p>
            </div>
          </div>

          {/* Form Tips & Common Mistakes */}
          {exercise.formTips && exercise.formTips.length > 0 && (
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Form Tips</span>
              </div>
              <ul className="text-xs text-emerald-200 space-y-1 list-disc list-inside">
                {exercise.formTips.map((tip: string, idx: number) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
            <div className="p-3.5 bg-amber-950/20 border border-amber-500/20 rounded-2xl space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Common Mistakes to Avoid</span>
              </div>
              <ul className="text-xs text-amber-200 space-y-1 list-disc list-inside">
                {exercise.commonMistakes.map((mistake: string, idx: number) => (
                  <li key={idx}>{mistake}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">Step-by-Step Instructions</h3>
            <ol className="space-y-2">
              {(exercise.instructions || []).map((step: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* License & Source Info */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center">
              <Shield className="w-3 h-3 mr-1 text-slate-600" />
              Source: {exercise.source || 'NutriRegion Exercise Studio'}
            </span>
            <span>License: {exercise.license || 'Licensed Dataset'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
