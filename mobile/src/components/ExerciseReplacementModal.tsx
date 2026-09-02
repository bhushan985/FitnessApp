import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Check, ArrowRight } from 'lucide-react';
import { exerciseApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetExerciseId: string;
  onSelectReplacement: (replacementExercise: any) => void;
}

export const ExerciseReplacementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetExerciseId,
  onSelectReplacement,
}) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && targetExerciseId) {
      loadReplacements();
    }
  }, [isOpen, targetExerciseId]);

  const loadReplacements = async () => {
    try {
      setLoading(true);
      const res = await exerciseApi.getReplacements(targetExerciseId);
      if (res.success && res.data) {
        setCandidates(res.data);
      }
    } catch (err) {
      console.error('Replacement fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <RefreshCw className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Replace Exercise</h3>
              <p className="text-xs text-slate-400">Select compatible alternative</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Searching exercise database for alternatives...</div>
        ) : (
          <div className="my-4 space-y-3 max-h-[55vh] overflow-y-auto pr-1 no-scrollbar">
            {candidates.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-800/40 rounded-2xl">
                No replacement exercises found matching current equipment constraints.
              </div>
            ) : (
              candidates.map((cand) => (
                <div
                  key={cand.exerciseId}
                  className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center justify-between hover:bg-slate-800 hover:border-amber-500/50 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={cand.mediaUrl || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'}
                      alt={cand.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300">{cand.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        <span className="text-amber-400 font-semibold">{cand.primaryMuscle}</span> • {cand.equipment}
                      </div>
                      <div className="text-[9px] text-slate-500 line-clamp-1">{cand.matchReason}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectReplacement(cand);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md shadow-amber-500/20 whitespace-nowrap"
                  >
                    Replace
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
