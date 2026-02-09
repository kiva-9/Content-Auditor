export enum AuditStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  WARNING = 'WARNING',
  UNKNOWN = 'UNKNOWN'
}

export interface AuditIssue {
  ruleId?: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  quote: string;
  suggestion: string;
}

export interface AuditReport {
  overallScore: number;
  status: AuditStatus;
  summary: string;
  issues: AuditIssue[];
  missingInfo: string[];
}

export interface AppState {
  article: string;
  rules: string;
  knowledgeBase: string;
  isAuditing: boolean;
  report: AuditReport | null;
  error: string | null;
}