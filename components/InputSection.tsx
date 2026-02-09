import React from 'react';

interface InputSectionProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  heightClass?: string;
  description: string;
}

export const InputSection: React.FC<InputSectionProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  heightClass = "h-40",
  description
}) => {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          {label}
        </label>
        <span className="text-xs text-slate-500 italic">{description}</span>
      </div>
      <textarea
        className={`w-full ${heightClass} p-3 border border-slate-300 rounded-lg text-sm font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white shadow-sm transition-all`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};