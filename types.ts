export enum AuditStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  WARNING = 'WARNING',
  UNKNOWN = 'UNKNOWN'
}

export interface KnowledgeBaseEntry {
  id: string;
  name: string;
  fileName: string;
  description: string;
  keywords: string[];
  content: string;
}

export interface AuditRulesPreset {
  id: string;
  name: string;
  fileName: string;
  description: string;
  content: string;
}

export interface AuditRoutingResult {
  productId: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface AuditContext {
  productId: string;
  productName: string;
  rulesId: string;
  rulesName: string;
  routingReason: string;
  routingConfidence: 'high' | 'medium' | 'low';
}

export interface AuditIssue {
  ruleId?: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  quote: string;
  suggestion: string;
}

export interface AuditReport {
  context: AuditContext;
  overallScore: number;
  status: AuditStatus;
  summary: string;
  issues: AuditIssue[];
  missingInfo: string[];
}

export interface AppState {
  article: string;
  rulesId: string;
  apiBase: string;
  apiKey: string;
  isAuditing: boolean;
  report: AuditReport | null;
  error: string | null;
}
