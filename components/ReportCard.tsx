import React from 'react';
import { AuditReport, AuditStatus } from '../types';
import { ShieldCheck, AlertTriangle, XCircle, HelpCircle, CheckCircle2 } from 'lucide-react';

interface ReportCardProps {
  report: AuditReport;
}

const SeverityBadge = ({ severity }: { severity: 'high' | 'medium' | 'low' }) => {
  const colors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-orange-100 text-orange-800 border-orange-200',
    low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${colors[severity]}`}>
      {severity}
    </span>
  );
};

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const getStatusColor = (status: AuditStatus) => {
    switch (status) {
      case AuditStatus.PASS: return 'text-green-600';
      case AuditStatus.FAIL: return 'text-red-600';
      case AuditStatus.WARNING: return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
      case AuditStatus.PASS: return <ShieldCheck className="w-8 h-8 text-green-600" />;
      case AuditStatus.FAIL: return <XCircle className="w-8 h-8 text-red-600" />;
      case AuditStatus.WARNING: return <AlertTriangle className="w-8 h-8 text-orange-500" />;
      default: return <HelpCircle className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {getStatusIcon(report.status)}
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Audit Report</h2>
            <p className={`font-mono font-medium ${getStatusColor(report.status)}`}>
              STATUS: {report.status} • SCORE: {report.overallScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Executive Summary</h3>
        <p className="text-slate-700 leading-relaxed">{report.summary}</p>
      </div>

      {/* Issues */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4 flex items-center gap-2">
          Detected Issues <span className="bg-slate-200 text-slate-600 px-2 rounded-full text-xs">{report.issues.length}</span>
        </h3>

        {report.issues.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span>No compliance issues found.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {report.issues.map((issue, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-slate-800">{issue.description}</span>
                  <SeverityBadge severity={issue.severity} />
                </div>
                <div className="bg-red-50 border-l-4 border-red-300 p-3 mb-3 text-sm italic text-slate-600">
                  "{issue.quote}"
                </div>
                <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded flex gap-2">
                  <span className="font-bold">Fix:</span> {issue.suggestion}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Missing Info */}
      {report.missingInfo.length > 0 && (
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2 flex items-center gap-2">
            Unable to Verify <HelpCircle className="w-4 h-4" />
          </h3>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {report.missingInfo.map((info, idx) => (
              <li key={idx}>{info}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};