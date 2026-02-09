import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AuditReport, AuditStatus } from "../types";

// Note: The system prompt requires using process.env.API_KEY.
// Ensure this is set in your environment.
const ai = new GoogleGenAI({ 
  apiKey: process.env.API_KEY,
});

const RESP_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "A score from 0 to 100 based on compliance." },
    status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARNING", "UNKNOWN"], description: "Overall audit status." },
    summary: { type: Type.STRING, description: "A brief executive summary of the audit findings." },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: ["high", "medium", "low"] },
          description: { type: Type.STRING, description: "Description of the violation." },
          quote: { type: Type.STRING, description: "The exact text from the article that triggered the issue." },
          suggestion: { type: Type.STRING, description: "How to fix the issue." }
        },
        required: ["severity", "description", "quote", "suggestion"]
      }
    },
    missingInfo: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of items that could not be verified due to lack of information in the article."
    }
  },
  required: ["overallScore", "status", "summary", "issues", "missingInfo"]
};

export const auditContent = async (
  article: string,
  rules: string,
  knowledgeBase: string
): Promise<AuditReport> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

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
  `;

  const prompt = `
    Input Data for Audit:

    --- BEGIN KNOWLEDGE BASE ---
    ${knowledgeBase}
    --- END KNOWLEDGE BASE ---

    --- BEGIN COMPLIANCE RULES ---
    ${rules}
    --- END COMPLIANCE RULES ---

    --- BEGIN ARTICLE TO AUDIT ---
    ${article}
    --- END ARTICLE TO AUDIT ---

    Perform the audit now. Return the result in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESP_SCHEMA,
        temperature: 0.1, // Low temperature for deterministic, factual results
      }
    });

    if (!response.text) {
      throw new Error("No response generated from the model.");
    }

    const jsonResult = JSON.parse(response.text) as AuditReport;
    return jsonResult;

  } catch (error) {
    console.error("Audit failed:", error);
    throw error;
  }
};