import React from 'react';

interface Props {
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  primaryColor?: string;
  secondaryColor?: string;
  inactiveColor?: string;
  className?: string;
}

export const AnatomicalMuscleMap: React.FC<Props> = ({
  primaryMuscles = [],
  secondaryMuscles = [],
  primaryColor = '#10b981', // Emerald 500
  secondaryColor = '#f59e0b', // Amber 500
  inactiveColor = '#334155', // Slate 700
  className = '',
}) => {
  const normPrimary = primaryMuscles.map((m) => m.toLowerCase());
  const normSecondary = secondaryMuscles.map((m) => m.toLowerCase());

  const getMuscleColor = (muscleKey: string, aliases: string[] = []) => {
    const allKeys = [muscleKey.toLowerCase(), ...aliases.map((a) => a.toLowerCase())];

    const isPrimary = normPrimary.some((p) =>
      allKeys.some((k) => p.includes(k) || k.includes(p))
    );
    if (isPrimary) return primaryColor;

    const isSecondary = normSecondary.some((s) =>
      allKeys.some((k) => s.includes(k) || k.includes(s))
    );
    if (isSecondary) return secondaryColor;

    return inactiveColor;
  };

  return (
    <div className={`p-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center space-y-3 ${className}`}>
      <div className="flex items-center space-x-6 text-[11px] font-bold uppercase tracking-wider">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="text-emerald-400">Primary Target</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <span className="text-amber-400">Secondary Target</span>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-8 py-2">
        {/* FRONT ANATOMY SVG */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Front View</span>
          <svg width="120" height="200" viewBox="0 0 120 200" className="drop-shadow-md">
            {/* Head & Neck */}
            <circle cx="60" cy="18" r="12" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <rect x="56" y="30" width="8" height="8" rx="2" fill="#1e293b" />

            {/* Chest (Pectorals) */}
            <path
              d="M 45 42 Q 60 40 75 42 L 72 60 Q 60 62 48 60 Z"
              fill={getMuscleColor('chest', ['pectoral', 'pecs', 'muscle_chest'])}
              stroke="#0f172a" strokeWidth="1.5"
            />

            {/* Front Deltoids (Left & Right) */}
            <path
              d="M 33 42 C 30 50 35 56 42 56 L 44 43 Z"
              fill={getMuscleColor('anterior_deltoid', ['deltoid', 'front delt', 'shoulders', 'muscle_anterior_deltoid'])}
              stroke="#0f172a" strokeWidth="1.5"
            />
            <path
              d="M 87 42 C 90 50 85 56 78 56 L 76 43 Z"
              fill={getMuscleColor('anterior_deltoid', ['deltoid', 'front delt', 'shoulders', 'muscle_anterior_deltoid'])}
              stroke="#0f172a" strokeWidth="1.5"
            />

            {/* Lateral Deltoids */}
            <path
              d="M 28 42 C 25 50 29 55 33 55 L 34 43 Z"
              fill={getMuscleColor('lateral_deltoid', ['side delt', 'deltoid', 'shoulders', 'muscle_lateral_deltoid'])}
              stroke="#0f172a" strokeWidth="1.5"
            />
            <path
              d="M 92 42 C 95 50 91 55 87 55 L 86 43 Z"
              fill={getMuscleColor('lateral_deltoid', ['side delt', 'deltoid', 'shoulders', 'muscle_lateral_deltoid'])}
              stroke="#0f172a" strokeWidth="1.5"
            />

            {/* Biceps */}
            <rect x="33" y="58" width="9" height="22" rx="4" fill={getMuscleColor('biceps', ['bicep', 'muscle_biceps'])} stroke="#0f172a" strokeWidth="1.5" />
            <rect x="78" y="58" width="9" height="22" rx="4" fill={getMuscleColor('biceps', ['bicep', 'muscle_biceps'])} stroke="#0f172a" strokeWidth="1.5" />

            {/* Abs / Core */}
            <rect x="49" y="63" width="22" height="32" rx="4" fill={getMuscleColor('abs', ['rectus_abdominis', 'core', 'waist', 'muscle_rectus_abdominis'])} stroke="#0f172a" strokeWidth="1.5" />

            {/* Quads */}
            <path d="M 44 100 Q 55 98 58 145 L 42 145 Z" fill={getMuscleColor('quads', ['quadriceps', 'thigh', 'legs', 'muscle_quads'])} stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 76 100 Q 65 98 62 145 L 78 145 Z" fill={getMuscleColor('quads', ['quadriceps', 'thigh', 'legs', 'muscle_quads'])} stroke="#0f172a" strokeWidth="1.5" />
          </svg>
        </div>

        {/* BACK ANATOMY SVG */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Back View</span>
          <svg width="120" height="200" viewBox="0 0 120 200" className="drop-shadow-md">
            {/* Head & Neck */}
            <circle cx="60" cy="18" r="12" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <rect x="56" y="30" width="8" height="8" rx="2" fill="#1e293b" />

            {/* Traps & Upper Back */}
            <polygon points="60,38 42,48 78,48" fill={getMuscleColor('traps', ['trapezius', 'upper back', 'muscle_traps'])} stroke="#0f172a" strokeWidth="1.5" />

            {/* Lats */}
            <path d="M 42 50 L 78 50 L 68 85 L 52 85 Z" fill={getMuscleColor('lats', ['latissimus', 'back', 'muscle_lats'])} stroke="#0f172a" strokeWidth="1.5" />

            {/* Posterior Rear Deltoids */}
            <path d="M 33 42 C 30 50 35 56 42 56 L 44 43 Z" fill={getMuscleColor('posterior_deltoid', ['rear delt', 'deltoid', 'shoulders', 'muscle_posterior_deltoid'])} stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 87 42 C 90 50 85 56 78 56 L 76 43 Z" fill={getMuscleColor('posterior_deltoid', ['rear delt', 'deltoid', 'shoulders', 'muscle_posterior_deltoid'])} stroke="#0f172a" strokeWidth="1.5" />

            {/* Triceps (Long & Lateral Heads) */}
            <rect x="30" y="58" width="10" height="24" rx="4" fill={getMuscleColor('triceps', ['tricep', 'triceps long', 'triceps lateral', 'muscle_triceps_long', 'muscle_triceps_lateral'])} stroke="#0f172a" strokeWidth="1.5" />
            <rect x="80" y="58" width="10" height="24" rx="4" fill={getMuscleColor('triceps', ['tricep', 'triceps long', 'triceps lateral', 'muscle_triceps_long', 'muscle_triceps_lateral'])} stroke="#0f172a" strokeWidth="1.5" />

            {/* Glutes */}
            <path d="M 43 90 C 43 110 59 110 59 90 Z" fill={getMuscleColor('glutes', ['gluteus', 'butt', 'legs', 'muscle_glutes'])} stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 77 90 C 77 110 61 110 61 90 Z" fill={getMuscleColor('glutes', ['gluteus', 'butt', 'legs', 'muscle_glutes'])} stroke="#0f172a" strokeWidth="1.5" />

            {/* Hamstrings */}
            <rect x="42" y="112" width="15" height="34" rx="4" fill={getMuscleColor('hamstrings', ['hamstring', 'rear thigh', 'legs', 'muscle_hamstrings'])} stroke="#0f172a" strokeWidth="1.5" />
            <rect x="63" y="112" width="15" height="34" rx="4" fill={getMuscleColor('hamstrings', ['hamstring', 'rear thigh', 'legs', 'muscle_hamstrings'])} stroke="#0f172a" strokeWidth="1.5" />

            {/* Calves */}
            <rect x="43" y="150" width="12" height="30" rx="3" fill={getMuscleColor('calves', ['calf', 'gastrocnemius', 'legs', 'muscle_calves'])} stroke="#0f172a" strokeWidth="1.5" />
            <rect x="65" y="150" width="12" height="30" rx="3" fill={getMuscleColor('calves', ['calf', 'gastrocnemius', 'legs', 'muscle_calves'])} stroke="#0f172a" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};
