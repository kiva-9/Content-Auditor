import React from 'react';
import { KnowledgeBaseEntry } from '../types';
import { FileText } from 'lucide-react';

interface KnowledgeBasePanelProps {
  entries: KnowledgeBaseEntry[];
  selectedId: string;
}

export const KnowledgeBasePanel: React.FC<KnowledgeBasePanelProps> = ({ entries, selectedId }) => {
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`border rounded-lg p-3 text-sm ${
            entry.id === selectedId
              ? 'border-blue-300 bg-blue-50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                {entry.name}
              </p>
              <p className="text-xs text-slate-500 mt-1">{entry.fileName}</p>
              <p className="text-xs text-slate-600 mt-2">{entry.description}</p>
            </div>
            {entry.id === selectedId && (
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                Selected
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
