import { AuditReport, AuditRoutingResult } from "../types";
import { auditRulesPresets, routingRuleSet } from "../data/rules";
import { knowledgeBaseEntries } from "../data/knowledgeBase";

const ROUTING_SCHEMA = {
  type: "object",
  properties: {
    productId: {
      type: "string",
      enum: [...knowledgeBaseEntries.map((entry) => entry.id), "unknown"],
      description: "Matched product ID from the catalog."
    },
    reason: {
      type: "string",
      description: "Short explanation referencing article phrases."
    },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"],
      description: "Confidence in the product match."
    }
  },
  required: ["productId", "reason", "confidence"],
  additionalProperties: false
};

const RESP_SCHEMA = {
  type: "object",
  properties: {
    context: {
      type: "object",
      properties: {
        productId: { type: "string" },
        productName: { type: "string" },
        rulesId: { type: "string" },
        rulesName: { type: "string" },
        routingReason: { type: "string" },
        routingConfidence: { type: "string", enum: ["high", "medium", "low"] }
      },
      required: ["productId", "productName", "rulesId", "rulesName", "routingReason", "routingConfidence"],
      additionalProperties: false
    },
    overallScore: { type: "number", description: "A score from 0 to 100 based on compliance." },
    status: { type: "string", enum: ["PASS", "FAIL", "WARNING", "UNKNOWN"], description: "Overall audit status." },
    summary: { type: "string", description: "A brief executive summary of the audit findings." },
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["high", "medium", "low"] },
          description: { type: "string", description: "Description of the violation." },
          quote: { type: "string", description: "The exact text from the article that triggered the issue." },
          suggestion: { type: "string", description: "How to fix the issue." }
        },
        required: ["severity", "description", "quote", "suggestion"],
        additionalProperties: false
      }
    },
    missingInfo: {
      type: "array",
      items: { type: "string" },
      description: "List of items that could not be verified due to lack of information in the article."
    }
  },
  required: ["context", "overallScore", "status", "summary", "issues", "missingInfo"],
  additionalProperties: false
};

const DEFAULT_MODEL = "gpt-4o-mini";

const createClient = (apiBase: string, apiKey: string) => {
  const normalizedBase = apiBase.replace(/\/$/, "");
  return async (payload: Record<string, unknown>) => {
    const response = await fetch(`${normalizedBase}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorBody}`);
    }

    return response.json();
  };
};

const parseJsonContent = <T,>(content: string | null | undefined): T => {
  if (!content) {
    throw new Error("No response generated from the model.");
  }
  return JSON.parse(content) as T;
};

const routeProduct = async (
  client: (payload: Record<string, unknown>) => Promise<any>,
  model: string,
  article: string
): Promise<AuditRoutingResult> => {
  const catalog = knowledgeBaseEntries
    .filter((entry) => entry.id !== 'general')
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      description: entry.description,
      keywords: entry.keywords
    }));

  const routingPrompt = `
You are classifying which product the article is about.

Routing Rules:
${routingRuleSet}

Product Catalog (JSON):
${JSON.stringify(catalog, null, 2)}

Article:
"""
${article}
"""

Return the productId, reason, and confidence as JSON.
  `.trim();

  const response = await client({
    model,
    messages: [
      { role: "system", content: "Return JSON only. Do not wrap in markdown." },
      { role: "user", content: routingPrompt },
    ],
    temperature: 0.1,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "routing_result",
        schema: ROUTING_SCHEMA,
      },
    },
  });

  const content = response?.choices?.[0]?.message?.content as string | null | undefined;
  return parseJsonContent<AuditRoutingResult>(content);
};

export const auditContent = async (
  article: string,
  rulesId: string,
  apiBase: string,
  apiKey: string,
  model: string = DEFAULT_MODEL
): Promise<AuditReport> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  if (!apiBase) {
    throw new Error("API Base URL is missing. Please check your configuration.");
  }

  const client = createClient(apiBase, apiKey);

  const rulesPreset = auditRulesPresets.find((rule) => rule.id === rulesId) ?? auditRulesPresets[0];
  const routing = await routeProduct(client, model, article);
  const matchedEntry = knowledgeBaseEntries.find((entry) => entry.id === routing.productId) 
    ?? knowledgeBaseEntries.find((entry) => entry.id === 'general')
    ?? knowledgeBaseEntries[0];

  const contextPayload = {
    productId: matchedEntry.id,
    productName: matchedEntry.name,
    rulesId: rulesPreset.id,
    rulesName: rulesPreset.name,
    routingReason: routing.reason,
    routingConfidence: routing.confidence,
  };

  const systemInstruction = `
    You are a strict, objective Content Compliance Auditor. 
    Your job is to verify the input Article against the provided Rules and Knowledge Base.

    Guidelines:
    1. Be extremely strict. If a rule is violated, report it.
    2. Only use the provided Knowledge Base to verify facts. Do not use outside knowledge.
    3. If the article claims something that contradicts the Knowledge Base, it is a High severity issue.
    4. If the article claims something not present in the Knowledge Base, mark it as "Unable to verify" in missingInfo, unless it's clearly a subjective marketing fluff that doesn't require factual verification.
    5. Do not hallucinate. If you cannot find the info, say so.
    6. Analyze tone and style as per rules.
    7. Return the context object exactly as provided.
  `;

  const prompt = `
Input Data for Audit:

--- BEGIN ROUTING CONTEXT (JSON) ---
${JSON.stringify(contextPayload, null, 2)}
--- END ROUTING CONTEXT ---

--- BEGIN KNOWLEDGE BASE (${matchedEntry.fileName}) ---
${matchedEntry.content}
--- END KNOWLEDGE BASE ---

--- BEGIN COMPLIANCE RULES (${rulesPreset.fileName}) ---
${rulesPreset.content}
--- END COMPLIANCE RULES ---

--- BEGIN ARTICLE TO AUDIT ---
${article}
--- END ARTICLE TO AUDIT ---

Perform the audit now. Return the result in JSON format.
  `;

  try {
    const response = await client({
      model,
      messages: [
        { role: "system", content: systemInstruction.trim() },
        { role: "user", content: prompt.trim() },
      ],
      temperature: 0.1,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "audit_report",
          schema: RESP_SCHEMA,
        },
      },
    });

    const content = response?.choices?.[0]?.message?.content as string | null | undefined;
    return parseJsonContent<AuditReport>(content);
  } catch (error) {
    console.error("Audit failed:", error);
    throw error;
  }
};
