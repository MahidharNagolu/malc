import React from 'react';

interface MacroRingProps {
  current: number;
  target: number;
  color: string;
  label: string;
  unit: string;
  size?: 'sm' | 'md' | 'lg';
}

const MacroRing: React.FC<MacroRingProps> = ({ current, target, color, label, unit, size = 'md' }) => {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const radius = size === 'lg' ? 50 : size === 'md' ? 35 : 25;
  const stroke = size === 'lg' ? 10 : size === 'md' ? 8 : 5;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClass = size === 'lg' ? 'w-32 h-32' : size === 'md' ? 'w-20 h-20' : 'w-14 h-14';
  const textClass = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-sm' : 'text-xs';

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClass} relative`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 absolute"
      >
        <circle
          stroke="#27272a" // zinc-800
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-zinc-100">
        <span className={`font-bold ${textClass}`}>{Math.round(current)}</span>
        {size === 'lg' && <span className="text-xs text-zinc-400">{unit}</span>}
      </div>
      {size !== 'lg' && (
        <span className="absolute -bottom-6 text-xs text-zinc-500 font-medium">{label}</span>
      )}
    </div>
  );
};

export default MacroRing;
