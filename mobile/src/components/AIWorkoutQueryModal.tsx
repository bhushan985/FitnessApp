import React, { useState } from 'react';
import { X, Sparkles, Send, Dumbbell, Zap } from 'lucide-react';
import { workoutApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutGenerated: (workout: any) => void;
}

export const AIWorkoutQueryModal: React.FC<Props> = ({ isOpen, onClose, onWorkoutGenerated }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const samplePrompts = [
    'I want back and biceps today but only have dumbbells',
    'Give me a 30-minute dumbbell back workout',
    'I want chest and triceps hypertrophy workout',
    'Give me a 15-minute home abs core workout',
  ];

  const handleParseAndGenerate = async (queryText?: string) => {
    const textToAsk = queryText || prompt;
    if (!textToAsk.trim()) return;

    try {
      setLoading(true);
      const res = await workoutApi.parseAIWorkout(textToAsk);
      if (res.success && res.data) {
        onWorkoutGenerated(res.data);
        onClose();
      }
    } catch (err) {
      console.error('AI workout parse error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Workout Builder</h3>
              <p className="text-xs text-teal-400">Describe your workout in natural language</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sample Prompt Chips */}
        <div className="my-4 space-y-2">
          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Try asking:</label>
          <div className="space-y-1.5">
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => handleParseAndGenerate(sp)}
                disabled={loading}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-teal-400/60 text-xs text-slate-300 hover:text-white transition flex items-center justify-between group"
              >
                <span>"{sp}"</span>
                <Zap className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleParseAndGenerate();
          }}
          className="pt-2 flex items-center space-x-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your workout request..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="p-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
