import superSaaS from '../knowledge-base/supersaas.md?raw';
import cloudSuite from '../knowledge-base/cloudsuite.md?raw';
import general from '../knowledge-base/general.md?raw';
import { KnowledgeBaseEntry } from '../types';

export const knowledgeBaseEntries: KnowledgeBaseEntry[] = [
  {
    id: 'supersaas',
    name: 'SuperSaaS',
    fileName: 'supersaas.md',
    description: 'B2B SaaS analytics and collaboration platform.',
    keywords: ['SuperSaaS', 'AI-powered analytics', 'Real-time collaboration', 'Pro plan'],
    content: superSaaS,
  },
  {
    id: 'cloudsuite',
    name: 'CloudSuite',
    fileName: 'cloudsuite.md',
    description: 'Cloud infrastructure management for cost and compliance.',
    keywords: ['CloudSuite', 'multi-cloud', 'cost optimization', 'compliance reports'],
    content: cloudSuite,
  },
  {
    id: 'general',
    name: 'General (Fallback)',
    fileName: 'general.md',
    description: 'Use when the product cannot be identified confidently.',
    keywords: [],
    content: general,
  },
];
