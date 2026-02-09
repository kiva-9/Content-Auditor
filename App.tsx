import React, { useState } from 'react';
import { DEFAULT_ARTICLE, DEFAULT_KNOWLEDGE_BASE, DEFAULT_RULES } from './constants';
import { InputSection } from './components/InputSection';
import { ReportCard } from './components/ReportCard';
import { auditContent } from './services/geminiService';
import { AuditReport } from './types';
import { Play, RotateCcw, Loader2 } from 'lucide-react';

const App = () => {
  const [article, setArticle] = useState(DEFAULT_ARTICLE);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [knowledgeBase, setKnowledgeBase] = useState(DEFAULT_KNOWLEDGE_BASE);
  
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async () => {
    setIsAuditing(true);
    setError(null);
    setReport(null);

    try {
      const result = await auditContent(article, rules, knowledgeBase);
      setReport(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during the audit.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Content<span className="text-blue-600">Auditor</span>
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Powered by gemini-3-pro-preview
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Context Config (Rules & KB) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                Audit Context
              </h2>
              <InputSection
                label="Knowledge Base"
                description="Facts the AI uses to verify truth."
                value={knowledgeBase}
                onChange={setKnowledgeBase}
                heightClass="h-60"
                placeholder="Paste product specs, policies, or facts here..."
              />
              <InputSection
                label="Compliance Rules"
                description="The checklist the AI must follow."
                value={rules}
                onChange={setRules}
                heightClass="h-40"
                placeholder="1. Tone must be... 2. Legal requirements..."
              />
            </div>
          </div>

          {/* Middle/Right: Action & Report */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Input Area */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                Content to Audit
              </h2>
              <InputSection
                label="Article Text"
                description="The draft you want to analyze."
                value={article}
                onChange={setArticle}
                heightClass="h-48"
                placeholder="Paste your article here..."
              />
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={handleAudit}
                  disabled={isAuditing}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all ${
                    isAuditing 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
                  }`}
                >
                  {isAuditing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Auditing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" /> Run Audit
                    </>
                  )}
                </button>

                {report && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3 animate-fade-in">
                <div className="mt-0.5 font-bold">Error:</div>
                <div>{error}</div>
              </div>
            )}

            {/* Results Area */}
            {report && <ReportCard report={report} />}
            
            {!report && !isAuditing && !error && (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 text-slate-300 ml-1" />
                </div>
                <p>Ready to audit. Click "Run Audit" to start analysis.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;