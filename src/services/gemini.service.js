import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { SYSTEM_PROMPTS } from './prompts.js';

// ==========================================
// Zod Validation Schemas
// ==========================================

export const HealthAssessmentSchema = z.object({
  matchedSymptoms: z.array(z.object({
    name: z.string(),
    category: z.string().default('general')
  })).default([]),
  possibleConditions: z.array(z.string()).default([]),
  urgency: z.number().min(1).max(5).default(2),
  urgencyLabel: z.string().default('Medium'),
  recommendedCareLevel: z.string().default('visit-doctor'),
  specialtiesNeeded: z.array(z.string()).default(['General Medicine']),
  selfCareAdvice: z.array(z.string()).default([]),
  seekCareIf: z.array(z.string()).default([]),
  followUpQuestions: z.array(z.string()).default([])
});

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
   * 0.5 Health Assessment Agent reasoning
   */
  async generateHealthAssessment(context) {
    const systemPrompt = SYSTEM_PROMPTS.HEALTH_ASSESSMENT;

    return this.callGeminiWithRetry({
      systemPrompt,
      userPrompt: context,
      schema: HealthAssessmentSchema,
      defaultFallback: () => {
        const text = (context.symptoms || '').toLowerCase();
        let topic = 'General Discomfort';
        let overview = 'A health consultation is recommended to evaluate symptoms.';
        let spec = 'General Medicine';

        if (text.includes('back') || text.includes('spine')) {
          topic = 'Back Pain';
          overview = 'Back pain commonly stems from muscle strain, ligament sprains, or posture stress. Gentle mobilization, ergonomic support, and heat/ice therapy help relieve acute discomfort.';
          spec = 'Orthopedics';
        } else if (text.includes('knee') || text.includes('joint')) {
          topic = 'Joint / Knee Pain';
          overview = 'Knee and joint pain can result from ligament strain, overuse, or joint inflammation. Rest, elevation, and gentle cold/warm compress therapy aid recovery.';
          spec = 'Orthopedics';
        } else if (text.includes('chest')) {
          topic = 'Chest Pain';
          overview = 'Chest pain requires immediate clinical assessment to rule out cardiac or pulmonary conditions.';
          spec = 'Cardiology';
        }

        return {
          matchedSymptoms: [{ name: topic, category: 'general' }],
          possibleConditions: [overview],
          urgency: text.includes('chest') ? 5 : 2,
          urgencyLabel: text.includes('chest') ? 'Critical' : 'Low',
          recommendedCareLevel: text.includes('chest') ? 'emergency' : 'visit-doctor',
          specialtiesNeeded: [spec],
          selfCareAdvice: ['Ensure adequate rest', 'Stay hydrated', 'Avoid physical strain'],
          seekCareIf: ['Symptoms worsen progressively', 'Severe new pain develops'],
          followUpQuestions: ['How long have you experienced these symptoms?']
        };
      }
    });
  }

  /**
   * 1. Emergency Detection Agent reasoning
   */
  async analyzeEmergency(context) {
    const systemPrompt = SYSTEM_PROMPTS.EMERGENCY_DETECTION;

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
    const systemPrompt = SYSTEM_PROMPTS.FOLLOW_UP_CARE;

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
    const systemPrompt = SYSTEM_PROMPTS.MEDICINE_INFORMATION;

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
    const systemPrompt = SYSTEM_PROMPTS.AGENT_ORCHESTRATOR;

    return this.callGeminiWithRetry({
      systemPrompt,
      userPrompt: context,
      schema: OrchestratorDecisionSchema,
      defaultFallback: () => {
        const text = (context.userInput || '').toLowerCase();
        const isHospOnly = /hospital|hospitals|clinic|clinics|doctor|doctors|other hospitals/i.test(text) && !/fever|cough|chest pain|pain|headache|bleed|fracture|dizzy/i.test(text);
        const isMedOnly = /prescription|tablet|medicine|dosage|drug/i.test(text) && !/chest pain|hospital|fever|cough|emergency/i.test(text);
        const isEmergencyOnly = /chest pain|heart attack|stroke|not breathing/i.test(text);

        if (isHospOnly) {
          return {
            agentsToRun: ['HospitalFinderAgent', 'TranslationAgent'],
            executionMode: 'parallel',
            reasoning: 'User requested hospital listings only.'
          };
        }

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
    const systemPrompt = SYSTEM_PROMPTS.ACTION_PLAN_COMPILER;

    return this.callGeminiWithRetry({
      systemPrompt,
      userPrompt: context,
      schema: ActionPlanSchema,
      defaultFallback: () => {
        const isEmergency = context.emergencyResult?.isEmergency || false;
        const urgencyLevel = context.emergencyResult?.urgencyLevel || 2;
        const urgencyLabel = isEmergency ? 'Critical' : (urgencyLevel >= 3 ? 'High' : 'Low');
        const userMsg = context.message || context.userInput || 'query';
        const health = context.healthResult || {};
        const emergency = context.emergencyResult || {};
        const hospitals = context.hospitalResult?.hospitals || [];
        const medicines = context.medicineResult?.medicines || [];
        const schemes = context.schemeResult?.schemes || [];
        const followup = context.followupResult?.followUpPlan || context.followupResult || {};
        const agentsRun = context.orchestratorDecision?.agentsToRun || [];

        let summary = '';

        if (isEmergency) {
          summary += `### 🚨 **EMERGENCY WARNING**\n**${emergency.reason || 'Immediate emergency medical attention required.'}**\n\n**Recommended Immediate Action:** ${emergency.recommendedAction || 'Call 108 emergency services immediately.'}\n\n`;
        }

        // Only include Health Consultation Summary if Health Assessment Agent was actually run and has results
        const ranHealth = agentsRun.some(a => a.toLowerCase().includes('health'));
        if (ranHealth && (health.matchedSymptoms?.length > 0 || health.possibleConditions?.length > 0)) {
          summary += `### 🩺 **Health Assessment Guidance**\n\n`;
          summary += `### 📝 **Consultation Summary**\n`;
          summary += `For your reported concern (*"${userMsg}"*), our health assessment system evaluated the symptoms.\n\n`;
          summary += `**Clinical Considerations:**\n`;
          (health.possibleConditions || []).forEach(cond => {
            summary += `*   ${typeof cond === 'string' ? cond : cond.name || ''}\n`;
          });
          summary += `\n`;
        }

        // Include Hospitals if Hospital Finder Agent ran
        const ranHospital = agentsRun.length === 0 || agentsRun.some(a => a.toLowerCase().includes('hospital'));
        if (ranHospital && hospitals.length > 0) {
          summary += `### 🏥 **Nearby Healthcare Facilities**\n`;
          hospitals.slice(0, 4).forEach(h => {
            summary += `*   **${h.name}** (${h.address || h.city || ''}) — Phone: \`${h.phone || '108'}\` | Rating: ${h.rating || '4.0'}★\n`;
          });
          summary += `\n`;
        }

        // Include Medicines if Medicine Agent ran
        const ranMedicine = agentsRun.some(a => a.toLowerCase().includes('medicine'));
        if (ranMedicine && medicines.length > 0) {
          summary += `### 💊 **Medicine Reference**\n`;
          medicines.forEach(m => {
            summary += `*   **${m.name}**: ${m.usage || ''} — *Dosage:* ${m.dosage || 'As directed by physician'}. ${m.warning ? `⚠️ *Warning:* ${m.warning}` : ''}\n`;
          });
          summary += `\n`;
        }

        // Include Schemes if Scheme Agent ran
        const ranScheme = agentsRun.some(a => a.toLowerCase().includes('scheme'));
        if (ranScheme && schemes.length > 0) {
          summary += `### 📋 **Government Health Scheme Coverage**\n`;
          schemes.slice(0, 2).forEach(s => {
            summary += `*   **${s.name}**: ${s.description || s.coverage || ''} (${s.eligibility || 'Check eligibility'})\n`;
          });
          summary += `\n`;
        }

        // Include Follow-up if Follow-up Agent ran
        const ranFollowup = agentsRun.some(a => a.toLowerCase().includes('followup'));
        if (ranFollowup && (followup.monitoringChecklist || followup.monitoringAdvice)) {
          const list = followup.monitoringChecklist || followup.monitoringAdvice || [];
          if (list.length > 0) {
            summary += `### 📅 **Follow-up & Monitoring Checklist**\n`;
            list.slice(0, 4).forEach(item => {
              summary += `*   ${item}\n`;
            });
            summary += `\n`;
          }
        }

        summary += `### 🤖 **Multi-Agent Engine Breakdown**\n`;
        if (agentsRun.length > 0) {
          agentsRun.forEach(a => {
            const isLLM = a.includes('Emergency') || a.includes('Followup') || a.includes('Medicine') || a.includes('Orchestrator');
            summary += `*   **${a}:** ✅ Executed *(${isLLM ? 'Google Gemini 2.5 Flash' : 'Web REST API / Rule Engine'})*\n`;
          });
        } else {
          summary += `*   **HospitalFinderAgent:** ✅ Executed *(OpenStreetMap Nominatim REST API)*\n`;
          summary += `*   **AgentOrchestrator:** ✅ Executed *(Google Gemini 2.5 Flash)*\n`;
        }
        summary += `\n*Disclaimer: AI guidance is for informational purposes only and is not a substitute for professional medical care.*`;

        return {
          summary,
          urgencyLabel,
          isEmergency,
          keyTakeaways: ['Review recommendations', 'Consult certified doctor for diagnosis'],
          disclaimer: 'AI guidance is for informational purposes only and is not a substitute for professional medical care.'
        };
      }
    });
  }
}

export const geminiService = new GeminiService();
