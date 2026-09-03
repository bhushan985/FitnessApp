import React from 'react';

interface RingProps {
  radius?: number;
  strokeWidth?: number;
  progress: number; // 0 to 100
  color?: string;
  bgColor?: string;
}

export const ProgressRing: React.FC<RingProps> = ({
  radius = 36,
  strokeWidth = 6,
  progress,
  color = '#00D084',
  bgColor = '#111D30',
}) => {
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
      <circle
        stroke={bgColor}
        fill="transparent"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
};
