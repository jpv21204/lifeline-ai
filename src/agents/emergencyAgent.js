import { geminiService } from '../services/gemini.service.js';

export class EmergencyAgent {
  constructor() {
    this.name = 'Emergency Detection Agent';
    this.icon = '📞';
  }

  /**
   * Process emergency detection using Gemini LLM reasoning.
   */
  async process(inputContext) {
    // Normalize input parameters
    const symptoms = typeof inputContext === 'string' 
      ? inputContext 
      : inputContext?.symptoms || '';
    
    const userProfile = inputContext?.userProfile || {};
    const previousConversation = inputContext?.previousConversation || [];
    const uploadedDocuments = inputContext?.uploadedDocuments || [];
    const extractedMedicalInformation = inputContext?.extractedMedicalInformation || inputContext?.healthResult || {};
    const medicineInformation = inputContext?.medicineInformation || {};

    const fullContext = {
      userProfile,
      symptoms,
      previousConversation,
      uploadedDocuments,
      extractedMedicalInformation,
      medicineInformation
    };

    // Query Gemini reasoning layer
    const geminiResult = await geminiService.analyzeEmergency(fullContext);

    const urgencyLevel = geminiResult.urgencyLevel || 2;
    const isEmergency = geminiResult.isEmergency ?? (urgencyLevel >= 4);
    const callEmergency = urgencyLevel >= 4;

    const severityMap = { 1: 'low', 2: 'low', 3: 'medium', 4: 'high', 5: 'critical' };
    const severity = severityMap[urgencyLevel] || 'low';

    const actionList = geminiResult.recommendedAction 
      ? [geminiResult.recommendedAction] 
      : ['Monitor symptoms carefully', 'Seek emergency medical attention if severe'];

    return {
      // Gemini LLM specific outputs
      urgencyLevel,
      isEmergency,
      reason: geminiResult.reason || 'Symptom analysis completed.',
      recommendedAction: geminiResult.recommendedAction || 'Seek clinical evaluation.',
      confidence: geminiResult.confidence ?? 0.9,
      disclaimer: geminiResult.disclaimer || 'AI guidance is not a substitute for professional medical care.',

      // Backward-compatible UI outputs
      severity,
      immediateActions: actionList,
      callEmergency,
      emergencyNumber: callEmergency ? '108' : '112',
      warningMessage: isEmergency 
        ? `⚠️ ${geminiResult.reason || 'Emergency condition detected. Seek immediate medical attention.'}`
        : 'No immediate emergency detected. Monitor symptoms carefully.',
      helplineNumbers: {
        ambulance: '108',
        emergency: '112',
        healthHelpline: '104',
        mentalHealth: '1800-599-0019',
        women: '181',
        childHelpline: '1098'
      }
    };
  }
}
