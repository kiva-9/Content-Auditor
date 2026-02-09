import React, { useState } from 'react';
import { DEFAULT_ARTICLE } from './constants';
import { ReportCard } from './components/ReportCard';
import { auditContent } from './services/geminiService';
import { AuditReport } from './types';
import { Play, RotateCcw, Loader2 } from 'lucide-react';
import { knowledgeBaseEntries } from './data/knowledgeBase';
import { auditRulesPresets } from './data/rules';
import { KnowledgeBasePanel } from './components/KnowledgeBasePanel';
import { RulesPanel } from './components/RulesPanel';

const App = () => {
  const [article, setArticle] = useState(DEFAULT_ARTICLE);
  const [rulesId, setRulesId] = useState(auditRulesPresets[0]?.id ?? 'standard');
  const [apiBase, setApiBase] = useState(() => localStorage.getItem('audit_api_base') ?? 'https://api.openai.com');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('audit_api_key') ?? '');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchedKbId = report?.context?.productId ?? 'general';

  const handleAudit = async () => {
    setIsAuditing(true);
    setError(null);
    setReport(null);

    try {
      const result = await auditContent(article, rulesId, apiBase, apiKey);
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
            Powered by OpenAI-compatible API
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
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                    API Configuration
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    Provide the OpenAI-compatible API base URL and key. Values are stored locally in this browser.
                  </p>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        API Base URL
                      </label>
                      <input
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        value={apiBase}
                        onChange={(event) => {
                          const value = event.target.value;
                          setApiBase(value);
                          localStorage.setItem('audit_api_base', value);
                        }}
                        placeholder="https://api.openai.com"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        API Key
                      </label>
                      <input
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        type="password"
                        value={apiKey}
                        onChange={(event) => {
                          const value = event.target.value;
                          setApiKey(value);
                          localStorage.setItem('audit_api_key', value);
                        }}
                        placeholder="sk-..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                    Knowledge Base Files
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    Stored as individual files for easy maintenance. The audit will auto-select the most relevant product.
                  </p>
                  <KnowledgeBasePanel entries={knowledgeBaseEntries} selectedId={matchedKbId} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                    Compliance Rules Presets
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    Choose one fixed rule set for the audit.
                  </p>
                  <RulesPanel presets={auditRulesPresets} selectedId={rulesId} onChange={setRulesId} />
                </div>
              </div>
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
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between items-baseline">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Article Text
                  </label>
                  <span className="text-xs text-slate-500 italic">Paste the draft you want to analyze.</span>
                </div>
                <textarea
                  className="w-full h-48 p-3 border border-slate-300 rounded-lg text-sm font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white shadow-sm transition-all"
                  value={article}
                  onChange={(e) => setArticle(e.target.value)}
                  placeholder="Paste your article here..."
                />
              </div>

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
