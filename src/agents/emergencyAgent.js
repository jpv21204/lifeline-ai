const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const EMERGENCY_PATTERNS = [
  { pattern: /chest\s*pain|seene?\s*(mein|me)?\s*dard|chathi\s*noppi/i, severity: 'critical', actions: ['Call 108 or 112 immediately', 'Chew an aspirin if available', 'Sit upright and rest', 'Loosen tight clothing', 'Do NOT lie flat'], warning: '⚠️ CHEST PAIN can be a sign of heart attack. Call emergency services NOW.' },
  { pattern: /heart\s*attack|dil\s*ka\s*daura/i, severity: 'critical', actions: ['Call 108 immediately', 'Chew an aspirin (300mg)', 'Sit in W-position', 'Loosen clothing', 'Do NOT drive yourself to hospital'], warning: '🚨 SUSPECTED HEART ATTACK - This is a life-threatening emergency!' },
  { pattern: /stroke|lakwa|paralysis|face\s*droop|arm\s*weak|speech\s*difficult/i, severity: 'critical', actions: ['Call 108 immediately - time is critical', 'Note the time symptoms started', 'Keep person lying down', 'Do NOT give food or water', 'Use FAST test: Face drooping, Arm weakness, Speech difficulty, Time to call'], warning: '🚨 POSSIBLE STROKE - Every minute counts! Call 108 NOW.' },
  { pattern: /not\s*breathing|saans\s*nahi|breathing\s*stop|unconscious|behosh/i, severity: 'critical', actions: ['Call 108 immediately', 'Check for breathing', 'Start CPR if trained', 'Clear airway', 'Place in recovery position'], warning: '🚨 LIFE-THREATENING - Person needs immediate emergency care!' },
  { pattern: /severe\s*bleeding|bahut\s*khoon|heavy\s*blood/i, severity: 'critical', actions: ['Call 108 immediately', 'Apply firm pressure with clean cloth', 'Elevate the injured area', 'Do NOT remove the cloth if soaked - add more', 'Keep person warm and calm'], warning: '🚨 SEVERE BLEEDING - Apply pressure and call emergency!' },
  { pattern: /choking|gala\s*ruk|can\'?t\s*breathe|gagging/i, severity: 'critical', actions: ['Perform Heimlich maneuver', 'For infant: 5 back blows + 5 chest thrusts', 'Call 108 if not resolved', 'Do NOT put fingers in mouth blindly'], warning: '🚨 CHOKING - Act immediately! Perform Heimlich maneuver.' },
  { pattern: /seizure|fits|mirgi|convulsion/i, severity: 'high', actions: ['Call 108 if seizure lasts more than 5 minutes', 'Clear area of dangerous objects', 'Turn person on their side', 'Do NOT put anything in their mouth', 'Time the seizure', 'Stay with them until fully conscious'], warning: '⚠️ SEIZURE - Keep person safe and time the episode.' },
  { pattern: /poison|zahar|vish|drank\s*chemical|ate\s*poison/i, severity: 'critical', actions: ['Call 108 and Poison Control', 'Identify the substance if possible', 'Do NOT induce vomiting unless advised', 'If chemical on skin, remove clothing and rinse', 'Bring substance container to hospital'], warning: '🚨 POISONING - Call emergency and identify the substance!' },
  { pattern: /snake\s*bite|saanp|paamu\s*kat/i, severity: 'critical', actions: ['Call 108 immediately', 'Keep calm and still', 'Immobilize bitten limb below heart level', 'Remove jewelry near bite', 'Do NOT cut, suck, or tourniquet', 'Note snake appearance if safe', 'Get anti-venom at hospital ASAP'], warning: '🚨 SNAKE BITE - Keep still and get to hospital immediately!' },
  { pattern: /difficulty\s*breathing|saans\s*lene|oopiri\s*aad|breathless|can\'?t\s*breathe/i, severity: 'high', actions: ['Sit upright', 'Use inhaler if prescribed', 'Call 108 if severe', 'Try pursed-lip breathing', 'Move to fresh air', 'Loosen clothing'], warning: '⚠️ BREATHING DIFFICULTY - Seek immediate medical attention if severe.' },
  { pattern: /anaphyla|severe\s*allerg|throat\s*swell|face\s*swell.*breathe/i, severity: 'critical', actions: ['Call 108 immediately', 'Use EpiPen if available', 'Lie down with legs elevated', 'Do NOT give food or water', 'Monitor breathing'], warning: '🚨 SEVERE ALLERGIC REACTION - This can be life-threatening!' },
  { pattern: /suicid|kill\s*my\s*self|end\s*my\s*life|want\s*to\s*die/i, severity: 'critical', actions: ['Call Vandrevala Foundation: 1860-2662-345', 'Call iCall: 9152987821', 'Call KIRAN Helpline: 1800-599-0019', 'Stay with the person', 'Remove access to harmful means', 'Listen without judgment'], warning: '🚨 MENTAL HEALTH CRISIS - You are not alone. Please call a helpline now.' },
  { pattern: /burn|jal\s*gaya|jalana|fire|aag/i, severity: 'high', actions: ['Cool burn under running water for 20 minutes', 'Remove clothing near burn (unless stuck)', 'Cover with clean cloth', 'Do NOT apply ice, butter, or toothpaste', 'Call 108 for large/deep burns'], warning: '⚠️ BURN INJURY - Cool with running water immediately.' },
  { pattern: /fever.*infant|baby.*fever|newborn.*fever|infant.*temperature/i, severity: 'high', actions: ['Call doctor immediately for infant fever', 'Do NOT give aspirin to children', 'Lukewarm sponge bath', 'Keep baby hydrated', 'Dress in light clothing'], warning: '⚠️ INFANT FEVER - Any fever in babies under 3 months needs immediate medical attention.' },
  { pattern: /blood.*vomit|vomit.*blood|ulti.*khoon|khoon.*ulti/i, severity: 'high', actions: ['Go to hospital immediately', 'Do not eat or drink anything', 'Save a sample if possible', 'Lie on your side', 'Note the color and amount'], warning: '⚠️ VOMITING BLOOD - Seek emergency care immediately.' }
];

export class EmergencyAgent {
  constructor() {
    this.name = 'Emergency Detection Agent';
    this.icon = '📞';
  }

  async process({ symptoms, healthResult }) {
    await delay(400 + Math.random() * 400);

    const text = (symptoms || '').toLowerCase();
    let highestSeverity = 'none';
    const severityRank = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    const allActions = [];
    const warnings = [];

    for (const ep of EMERGENCY_PATTERNS) {
      if (ep.pattern.test(text)) {
        if (severityRank[ep.severity] > severityRank[highestSeverity]) {
          highestSeverity = ep.severity;
        }
        allActions.push(...ep.actions);
        warnings.push(ep.warning);
      }
    }

    // Check health assessment urgency
    if (healthResult && healthResult.urgency >= 4) {
      if (severityRank[highestSeverity] < severityRank['high']) {
        highestSeverity = 'high';
      }
    }

    const isEmergency = severityRank[highestSeverity] >= severityRank['high'];
    const callEmergency = severityRank[highestSeverity] >= severityRank['critical'];

    // Deduplicate actions
    const uniqueActions = [...new Set(allActions)].slice(0, 8);

    return {
      isEmergency,
      severity: highestSeverity,
      immediateActions: uniqueActions.length > 0 ? uniqueActions : ['Monitor symptoms carefully', 'Seek medical attention if symptoms worsen'],
      callEmergency,
      emergencyNumber: callEmergency ? '108' : '112',
      warningMessage: warnings.length > 0 ? warnings[0] : (isEmergency ? '⚠️ Your symptoms suggest you need urgent medical attention.' : 'No emergency detected. Monitor your symptoms.'),
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
