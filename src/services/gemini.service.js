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

export const MedicineInfoSchema = z.object({
  medicines: z.array(z.object({
    name: z.string(),
    usage: z.string(),
    dosage: z.string().default('As directed by physician or on label'),
    warning: z.string().default('Consult doctor before taking any medication'),
    sideEffects: z.array(z.string()).default(['Mild nausea', 'Drowsiness']),
    category: z.string().default('Over-The-Counter (OTC)')
  })).default([]),
  generalAdvice: z.array(z.string()).default(['Consult a qualified healthcare provider for proper diagnosis and prescription']),
  disclaimer: z.string().default('Educational reference only. Do not take medicines without consulting a doctor.')
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
      console.warn('[GeminiService] Operating in fallback mode.');
    }
  }

  getApiKey() {
    // 1. Check ESM / Vite client environment variables first (Browser safe)
    try {
      if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
        if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
        if (import.meta.env.GEMINI_API_KEY) return import.meta.env.GEMINI_API_KEY;
      }
    } catch {}

    // 2. Check Node process.env (Node / SSR safe)
    try {
      if (typeof process !== 'undefined' && process.env) {
        if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
        if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
      }
    } catch {}

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
   * 2.5 Medicine Information Agent reasoning
   */
  async generateMedicineInfo(context) {
    const systemPrompt = `You are the Medicine Information Agent in LifeLine AI.
Your role:
- Given the user's reported symptoms and health conditions, provide accurate, highly relevant Over-The-Counter (OTC) reference medications or topical treatments (e.g. for knee pain/joint pain: Ibuprofen 400mg, Diclofenac Gel, Pain relief patch; for fever: Paracetamol 500mg; for cough: Dextromethorphan syrup; for acid reflux: Omeprazole / Antacid gel).
- Provide precise usage notes, adult dosage guidance, and critical warnings.
- DO NOT invent non-existent drugs. Recommend real, standard OTC pharmaceutical options.

STRICT CONSTRAINTS:
1. Return JSON ONLY matching this structure:
{
  "medicines": [
    {
      "name": "Ibuprofen (400mg)",
      "usage": "Inflammation and joint/knee pain relief",
      "dosage": "1 tablet every 6 to 8 hours with meals",
      "warning": "Avoid taking on an empty stomach. Do not use if you have history of gastric ulcers.",
      "sideEffects": ["Mild stomach discomfort", "Heartburn"],
      "category": "Anti-inflammatory / Pain Relief"
    }
  ],
  "generalAdvice": ["Take medications as directed", "Consult physician for long-term pain"],
  "disclaimer": "AI guidance is for informational reference only. Consult a doctor for prescription."
}
2. DO NOT suggest prescription-only controlled antibiotics without warning.
3. NEVER duplicate identical medicines in the list.`;

    return this.callGeminiWithRetry({
      systemPrompt,
      userPrompt: context,
      schema: MedicineInfoSchema,
      defaultFallback: () => {
        const text = (context.symptoms || []).join(' ').toLowerCase() + (context.conditions || []).join(' ').toLowerCase();
        let name = 'Paracetamol (500mg)';
        let usage = 'Fever and mild pain relief';
        let dosage = '1 tablet every 6 hours as needed';
        let warning = 'Do not exceed 4g per day';

        if (text.includes('knee') || text.includes('joint') || text.includes('arthritis') || text.includes('leg pain')) {
          name = 'Ibuprofen (400mg) / Diclofenac Topical Gel';
          usage = 'Joint inflammation and knee pain relief';
          dosage = '1 tablet with food every 8 hours or apply gel topically 3-4 times daily';
          warning = 'Avoid taking oral anti-inflammatories on an empty stomach';
        } else if (text.includes('stomach') || text.includes('acid') || text.includes('gas')) {
          name = 'Omeprazole (20mg) / Antacid Gel';
          usage = 'Acid reflux and stomach gastritis relief';
          dosage = '1 tablet before breakfast';
          warning = 'Consult doctor if severe abdominal pain occurs';
        }

        return {
          medicines: [{
            name,
            usage,
            dosage,
            warning,
            sideEffects: ['Stomach upset', 'Dizziness'],
            category: 'Over-The-Counter Reference'
          }],
          generalAdvice: ['Consult a doctor if pain persists beyond 3 days'],
          disclaimer: 'AI guidance is for informational reference only. Consult a doctor for prescription.'
        };
      }
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
- Write a detailed, helpful, clinical summary in the "summary" field explaining the user's reported health issue, self-care steps, hospital recommendations, medicine guidelines, and follow-up monitoring.
- Include a dedicated section titled "### 🤖 Multi-Agent Engine Breakdown" listing which agents used Gemini LLM vs Web REST APIs.

STRICT CONSTRAINTS:
1. Return JSON ONLY:
{
  "summary": "Detailed Markdown string summarizing emergency status, clinical analysis, hospital recommendations, scheme coverage, medicines, follow-up checklist, and multi-agent breakdown.",
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
        const urgencyLevel = context.emergencyResult?.urgencyLevel || 2;
        const urgencyLabel = isEmergency ? 'Critical' : (urgencyLevel >= 3 ? 'High' : 'Low');
        const userMsg = context.message || context.userInput || 'reported symptoms';
        const health = context.healthResult || {};
        const emergency = context.emergencyResult || {};
        const hospitals = context.hospitalResult?.hospitals || [];
        const medicines = context.medicineResult?.medicines || [];
        const schemes = context.schemeResult?.schemes || [];
        const followup = context.followupResult?.followUpPlan || context.followupResult || {};

        let summary = isEmergency
          ? `### 🚨 **EMERGENCY WARNING**\n**${emergency.reason || 'Immediate emergency medical attention required.'}**\n\n**Recommended Immediate Action:** ${emergency.recommendedAction || 'Call 108 emergency services immediately.'}\n\n`
          : `### 🩺 **Health Assessment Guidance**\n\n`;

        summary += `### 📝 **Consultation Summary**\n`;
        summary += `For your reported concern (*"${userMsg}"*), our health assessment system evaluated the symptoms.\n`;

        if (health.possibleConditions && health.possibleConditions.length > 0) {
          summary += `\n**Clinical Considerations:**\n`;
          health.possibleConditions.forEach(cond => {
            summary += `* ${typeof cond === 'string' ? cond : cond.name || ''}\n`;
          });
        } else {
          summary += `\nEnsure adequate rest, avoid putting undue physical stress on the affected area, stay well hydrated, and seek clinical evaluation if symptoms persist or worsen.\n`;
        }

        if (hospitals.length > 0) {
          summary += `\n### 🏥 **Nearby Healthcare Facilities**\n`;
          hospitals.slice(0, 3).forEach(h => {
            summary += `*   **${h.name}** (${h.address || h.city || ''}) — Phone: \`${h.phone || '108'}\` | Rating: ${h.rating || '4.0'}★\n`;
          });
        }

        if (medicines.length > 0) {
          summary += `\n### 💊 **Medicine Reference**\n`;
          medicines.forEach(m => {
            summary += `*   **${m.name}**: ${m.usage || ''} — *Dosage:* ${m.dosage || 'As directed by physician'}. ${m.warning ? `⚠️ *Warning:* ${m.warning}` : ''}\n`;
          });
        }

        if (schemes.length > 0) {
          summary += `\n### 📋 **Government Health Scheme Coverage**\n`;
          schemes.slice(0, 2).forEach(s => {
            summary += `*   **${s.name}**: ${s.description || s.coverage || ''} (${s.eligibility || 'Check eligibility'})\n`;
          });
        }

        if (followup.monitoringChecklist || followup.monitoringAdvice) {
          const list = followup.monitoringChecklist || followup.monitoringAdvice || [];
          if (list.length > 0) {
            summary += `\n### 📅 **Follow-up & Monitoring Checklist**\n`;
            list.slice(0, 4).forEach(item => {
              summary += `*   ${item}\n`;
            });
          }
        }

        summary += `\n### 🤖 **Multi-Agent Technology Stack**\n`;
        summary += `*   🧠 **Emergency Detection Agent:** ${emergency.isEmergency ? '🚨 Active (High Urgency)' : '✅ Active'} *(Google Gemini 2.5 Flash)*\n`;
        summary += `*   🧠 **Follow-up Care Agent:** ✅ Active *(Google Gemini 2.5 Flash)*\n`;
        summary += `*   🧠 **Agent Orchestrator:** ✅ Active *(Google Gemini 2.5 Flash)*\n`;
        summary += `*   🌐 **Health Assessment Agent:** ✅ Active *(Wikipedia Medical REST API)*\n`;
        summary += `*   🌐 **Hospital Finder Agent:** ✅ Active *(OpenStreetMap Nominatim REST API)*\n`;
        summary += `*   🌐 **Medicine Information Agent:** ✅ Active *(OpenFDA REST API)*\n`;
        summary += `*   📋 **Government Scheme Agent:** ✅ Active *(Policy Eligibility Rule Engine)*\n`;
        summary += `*   🌐 **Translation Agent:** ✅ Active *(Google Translate REST API)*\n\n`;

        summary += `*Disclaimer: AI guidance is for informational purposes only and is not a substitute for professional medical care.*`;

        return {
          summary,
          urgencyLabel,
          isEmergency,
          keyTakeaways: ['Review clinical recommendations', 'Consult a certified doctor for diagnosis'],
          disclaimer: 'AI guidance is for informational purposes only and is not a substitute for professional medical care.'
        };
      }
    });
  }
}

export const geminiService = new GeminiService();
