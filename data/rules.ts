import auditStandard from '../rules/audit-standard.md?raw';
import auditStrict from '../rules/audit-strict.md?raw';
import routingRules from '../rules/routing.md?raw';
import { AuditRulesPreset } from '../types';

export const auditRulesPresets: AuditRulesPreset[] = [
  {
    id: 'standard',
    name: 'Standard Marketing Review',
    fileName: 'audit-standard.md',
    description: 'Balanced checks for marketing and compliance accuracy.',
    content: auditStandard,
  },
  {
    id: 'strict',
    name: 'Strict Compliance Review',
    fileName: 'audit-strict.md',
    description: 'Tight verification for regulated or high-risk content.',
    content: auditStrict,
  },
];

export const routingRuleSet = routingRules;
