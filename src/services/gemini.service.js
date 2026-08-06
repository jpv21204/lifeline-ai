import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

// ==========================================
// Zod Validation Schemas
// ==========================================

export const EmergencySchema = z.object({
  urgencyLevel: z.number().min(1).max(5),
  isEmergency: z.boolean(),
  reason: z.string(),
  recommendedAction: z.string(),
  confidence: z.number().min(0).max(1),
  disclaimer: z.string().default('AI guidance is not a substitute for professional medical care. Seek emergency services immediately if severe.')
});

export const FollowUpSchema = z.object({
  followUpPlan: z.object({
    medicineSchedule: z.array(z.object({
      medicine: z.string(),
      dosage: z.string().optional().default('As directed'),
      timing: z.string().default('Daily'),
      instructions: z.string().optional().default('Take with water')
    })).default([]),
    monitoringChecklist: z.array(z.string()).default([]),
    warningSigns: z.array(z.string()).default([]),
    nextVisit: z.string().default('Within 3-5 days if symptoms persist'),
    lifestyleRecommendations: z.array(z.string()).default([]),
    vaccinationReminders: z.array(z.string()).default([]),
    hydrationReminders: z.array(z.string()).default([]),
    restAdvice: z.array(z.string()).default([])
  })
});

export const OrchestratorDecisionSchema = z.object({
  agentsToRun: z.array(z.string()),
  executionMode: z.enum(['parallel', 'sequential']).default('parallel'),
  reasoning: z.string(),
  additionalClarificationNeeded: z.boolean().default(false),
  clarificationPrompt: z.string().optional()
});

export const ActionPlanSchema = z.object({
  summary: z.string(),
  urgencyLabel: z.string(),
  isEmergency: z.boolean(),
  keyTakeaways: z.array(z.string()).default([]),
  disclaimer: z.string().default('AI guidance is for informational purposes only and is not a substitute for professional medical care.')
});

// ==========================================
// Reusable Gemini Service
// ==========================================

export class GeminiService {
  constructor() {
    this.apiKey = this.getApiKey();
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
      console.warn('[GeminiService] No GEMINI_API_KEY or VITE_GEMINI_API_KEY found. Operating in fallback mode.');
    }
  }

  getApiKey() {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
      if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8');
          const match = content.match(/(?:GEMINI_API_KEY|VITE_GEMINI_API_KEY)=(.*)/);
          if (match && match[1]) return match[1].trim();
        }
      } catch {}
    }
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
      if (import.meta.env.GEMINI_API_KEY) return import.meta.env.GEMINI_API_KEY;
    }
    return '';
  }

  /**
   * Helper method to call Gemini API with retries, structured JSON enforcement, and Zod validation.
   */
  async callGeminiWithRetry({ systemPrompt, userPrompt, schema, defaultFallback, maxRetries = 2 }) {
    if (!this.ai || !this.apiKey) {
      return defaultFallback();
    }

    const fullPrompt = `${systemPrompt}\n\nContext & Input:\n${typeof userPrompt === 'string' ? userPrompt : JSON.stringify(userPrompt, null, 2)}\n\nIMPORTANT: Return strict JSON only. Do not include markdown code block ticks unless raw JSON formatting. Never diagnose or prescribe.`;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          }
        });

        const rawText = response.text || '';
        const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsedJson = JSON.parse(cleanedText);

        if (schema) {
          const validated = schema.parse(parsedJson);
          return validated;
        }
        return parsedJson;
      } catch (err) {
        console.warn(`[GeminiService] Attempt ${attempt + 1}/${maxRetries + 1} failed:`, err.message || err);
        if (attempt === maxRetries) {
          console.error('[GeminiService] All Gemini retries failed. Using structured fallback.');
          return defaultFallback();
        }
        await new Promise(r => setTimeout(r, 400 * Math.pow(2, attempt)));
      }
    }

    return defaultFallback();
  }

  /**
   * 1. Emergency Detection Agent reasoning
   */
  async analyzeEmergency(context) {
    const systemPrompt = `You are the Emergency Detection Agent in LifeLine AI.
Your role:
- Analyze the complete user context (profile, symptoms, conversation history, uploaded documents, extracted medical info, medicine data).
- Understand clinical symptoms instead of simple keyword matching.
- Detect medical emergencies (e.g. severe shortness of breath, sudden chest pain, stroke signs, heavy bleeding, anaphylaxis).
- Estimate an urgency level from 1 (Low/Self-care) to 5 (Critical Emergency).
- Explain why the situation is considered urgent.
- Recommend immediate next actions.
- Provide a confidence score between 0.0 and 1.0.

STRICT CONSTRAINTS:
1. Return JSON ONLY matching this exact structure:
{
  "urgencyLevel": 5,
  "isEmergency": true,
  "reason": "Clear explanation of urgency based on context",
  "recommendedAction": "Immediate recommendation for action",
  "confidence": 0.95,
  "disclaimer": "AI guidance is not a substitute for professional medical care. Seek emergency services immediately if severe."
}
2. NEVER diagnose specific diseases.
3. NEVER prescribe medicines.
4. Always include the medical disclaimer.`;

    return this.callGeminiWithRetry({
      systemPrompt,
      userPrompt: context,
      schema: EmergencySchema,
      defaultFallback: () => {
        const text = (context.symptoms || '').toLowerCase();
        const isCritical = /chest pain|heart attack|stroke|not breathing|unconscious|severe bleeding|choking|anaphyla/i.test(text);
        const isUrgent = isCritical || /difficulty breathing|seizure|poison|fever.*infant/i.test(text);
        return {
          urgencyLevel: isCritical ? 5 : (isUrgent ? 4 : 2),
          isEmergency: isUrgent,
          reason: isUrgent ? 'Symptoms indicate potential high urgency requiring clinical attention.' : 'No immediate life-threatening emergency detected.',
          recommendedAction: isCritical ? 'Call 108 immediately and seek emergency medical care.' : (isUrgent ? 'Consult a healthcare professional promptly.' : 'Monitor symptoms and rest.'),
          confidence: 0.85,
          disclaimer: 'AI guidance is not a substitute for professional medical care. Seek emergency services immediately if severe.'
        };
      }
    });
  }

  /**
   * 2. Follow-up Care Agent reasoning
   */
  async generateFollowUp(context) {
    const systemPrompt = `You are the Follow-up Care Agent in LifeLine AI.
Your role:
- Generate personalized follow-up care plans using symptoms, medicines, uploaded prescriptions, diagnosis extracted by other agents, user age, chronic conditions, and allergies.
- Generate medication reminders (from provided medicine info - DO NOT invent new medicines), hydration reminders, rest advice, follow-up appointment timing (nextVisit), warning signs, vaccination reminders (if applicable), lifestyle recommendations, and a monitoring checklist.

STRICT CONSTRAINTS:
1. Return JSON ONLY matching this structure:
{
  "followUpPlan": {
    "medicineSchedule": [
      { "medicine": "Name", "dosage": "Dosage", "timing": "Frequency/Timing", "instructions": "Usage note" }
    ],
    "monitoringChecklist": ["Daily check 1", "Daily check 2"],
    "warningSigns": ["Warning sign 1", "Warning sign 2"],
    "nextVisit": "Within 3 days",
    "lifestyleRecommendations": ["Rec 1", "Rec 2"],
    "vaccinationReminders": [],
    "hydrationReminders": ["Drink 2.5-3L water daily"],
    "restAdvice": ["Adequate sleep 7-8 hours"]
  }
}
2. NEVER invent new medications. Use only information provided in context or extracted by Medicine/Health agents.
3. NEVER prescribe new treatments.`;

    return this.callGeminiWithRetry({
      systemPrompt,
      userPrompt: context,
      schema: FollowUpSchema,
      defaultFallback: () => ({
        followUpPlan: {
          medicineSchedule: (context.medicines || []).map(m => ({
            medicine: m.name || m.genericName || 'Prescribed Medicine',
            dosage: m.dosage || 'As directed',
            timing: 'Daily',
            instructions: m.warning || 'Follow doctor guidance'
          })),
          monitoringChecklist: [
            'Monitor temperature twice daily if feverish',
            'Record any new or worsening symptoms',
            'Check blood pressure and pulse if feeling dizzy'
          ],
          warningSigns: [
            'Difficulty breathing or sudden chest discomfort',
            'High fever persisting beyond 3 days',
            'Extreme lethargy or confusion'
          ],
          nextVisit: context.urgency >= 4 ? 'Within 24-48 hours' : 'Within 3-5 days if symptoms persist',
          lifestyleRecommendations: [
            'Maintain adequate hydration (2.5 - 3 liters daily)',
            'Ensure 7-8 hours of restful sleep',
            'Avoid strenuous physical exertion'
          ],
          vaccinationReminders: [],
          hydrationReminders: ['Sip fluids frequently throughout the day'],
          restAdvice: ['Rest in a well-ventilated room']
        }
      })
    });
  }

  /**
   * 3. Intelligent Agent Orchestrator decision
   */
  async orchestrateAgents(context) {
    const systemPrompt = `You are the Intelligent Agent Orchestrator in LifeLine AI.
Your role:
- Inspect user input, uploaded files/prescriptions, image analysis, medicine data, and emergency indicators.
- Decide which agents MUST execute to fulfill the request efficiently.
Available Agent Identifiers:
  - "EmergencyAgent" (or "emergency_detection")
  - "HealthAssessmentAgent" (or "health_assessment")
  - "HospitalFinderAgent" (or "hospital_finder")
  - "MedicineAgent" (or "medicine_info")
  - "GovernmentSchemeAgent" (or "government_scheme")
  - "FollowupAgent" (or "followup")
  - "TranslationAgent" (or "translation")

Rules for Routing:
- If user uploads ONLY a prescription or asks only about a medicine: run MedicineAgent, FollowupAgent, TranslationAgent (DO NOT run HospitalFinder, GovernmentScheme, EmergencyAgent unless chest pain/emergency is indicated).
- If user reports chest pain / emergency: run EmergencyAgent, HospitalFinderAgent, FollowupAgent, TranslationAgent.
- If user asks general health/symptom query: run HealthAssessmentAgent, EmergencyAgent, HospitalFinderAgent, GovernmentSchemeAgent, MedicineAgent, FollowupAgent, TranslationAgent.

STRICT CONSTRAINTS:
1. Return JSON ONLY matching this structure:
{
  "agentsToRun": ["EmergencyAgent", "HospitalFinderAgent", "FollowupAgent", "TranslationAgent"],
  "executionMode": "parallel",
  "reasoning": "Clear short explanation of agent routing decision",
  "additionalClarificationNeeded": false
}`;

    return this.callGeminiWithRetry({
      systemPrompt,
      userPrompt: context,
      schema: OrchestratorDecisionSchema,
      defaultFallback: () => {
        const text = (context.userInput || '').toLowerCase();
        const isMedOnly = /prescription|tablet|medicine|dosage|drug/i.test(text) && !/chest pain|hospital|fever|cough|emergency/i.test(text);
        const isEmergencyOnly = /chest pain|heart attack|stroke|not breathing/i.test(text);

        if (isMedOnly) {
          return {
            agentsToRun: ['MedicineAgent', 'FollowupAgent', 'TranslationAgent'],
            executionMode: 'parallel',
            reasoning: 'Prescription/Medicine query requires medicine info, follow-up schedule, and translation.'
          };
        }

        if (isEmergencyOnly) {
          return {
            agentsToRun: ['EmergencyAgent', 'HospitalFinderAgent', 'FollowupAgent', 'TranslationAgent'],
            executionMode: 'parallel',
            reasoning: 'Emergency symptoms require immediate risk detection, hospital locator, and follow-up guidance.'
          };
        }

        return {
          agentsToRun: [
            'HealthAssessmentAgent',
            'EmergencyAgent',
            'HospitalFinderAgent',
            'GovernmentSchemeAgent',
            'MedicineAgent',
            'FollowupAgent',
            'TranslationAgent'
          ],
          executionMode: 'parallel',
          reasoning: 'Comprehensive symptom assessment requires full multi-agent evaluation.'
        };
      }
    });
  }

  /**
   * 4. Final Unified Action Plan Generator
   */
  async generateActionPlan(context) {
    const systemPrompt = `You are the Action Plan Compiler in LifeLine AI.
Your role:
- Combine all gathered agent outputs (Health Assessment, Emergency Detection, Hospital Finder, Government Schemes, Medicine Info, Follow-up Care) into a clear, cohesive, markdown-formatted Personalized Healthcare Action Plan.

STRICT CONSTRAINTS:
1. Return JSON ONLY:
{
  "summary": "Detailed Markdown string summarizing emergency status, clinical analysis, hospital recommendations, scheme coverage, medicines, and follow-up checklist.",
  "urgencyLabel": "Critical" | "High" | "Medium" | "Low",
  "isEmergency": boolean,
  "keyTakeaways": ["Point 1", "Point 2"],
  "disclaimer": "AI guidance is for informational purposes only and is not a substitute for professional medical care."
}
2. DO NOT diagnose diseases. DO NOT prescribe medications. Always emphasize emergency steps if isEmergency is true.`;

    return this.callGeminiWithRetry({
      systemPrompt,
      userPrompt: context,
      schema: ActionPlanSchema,
      defaultFallback: () => {
        const isEmergency = context.emergencyResult?.isEmergency || false;
        const urgencyLabel = isEmergency ? 'Critical' : 'Low';
        let summary = isEmergency
          ? `### 🚨 **EMERGENCY WARNING**\n**Immediate medical attention required.**\n\n`
          : `### 🩺 **Health Assessment Guidance**\n\n`;

        summary += `**Summary of Consultation:**\nSymptoms evaluated. Please follow the guidance below.\n\n`;

        if (context.hospitalResult?.hospitals?.length > 0) {
          summary += `### 🏥 **Nearby Hospitals**\n`;
          context.hospitalResult.hospitals.slice(0, 2).forEach(h => {
            summary += `*   **${h.name}** (${h.address}) - Phone: ${h.phone}\n`;
          });
          summary += `\n`;
        }

        if (context.medicineResult?.medicines?.length > 0) {
          summary += `### 💊 **Medicine Reference**\n`;
          context.medicineResult.medicines.forEach(m => {
            summary += `*   **${m.name}**: ${m.usage || ''} - ${m.dosage || ''}\n`;
          });
          summary += `\n`;
        }

        summary += `*Disclaimer: AI guidance is for informational purposes only and is not a substitute for professional medical care.*`;

        return {
          summary,
          urgencyLabel,
          isEmergency,
          keyTakeaways: ['Review emergency actions if urgent', 'Consult certified doctor for diagnosis'],
          disclaimer: 'AI guidance is for informational purposes only and is not a substitute for professional medical care.'
        };
      }
    });
  }
}

export const geminiService = new GeminiService();
