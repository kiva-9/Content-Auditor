import React from 'react';
import { AuditRulesPreset } from '../types';
import { ShieldCheck } from 'lucide-react';

interface RulesPanelProps {
  presets: AuditRulesPreset[];
  selectedId: string;
  onChange: (id: string) => void;
}

export const RulesPanel: React.FC<RulesPanelProps> = ({ presets, selectedId, onChange }) => {
  return (
    <div className="space-y-3">
      {presets.map((preset) => (
        <button
          type="button"
          key={preset.id}
          onClick={() => onChange(preset.id)}
          className={`w-full text-left border rounded-lg p-3 text-sm transition-colors ${
            preset.id === selectedId
              ? 'border-purple-300 bg-purple-50'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                {preset.name}
              </p>
              <p className="text-xs text-slate-500 mt-1">{preset.fileName}</p>
              <p className="text-xs text-slate-600 mt-2">{preset.description}</p>
            </div>
            {preset.id === selectedId && (
              <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
