import medicinesData from '../data/medicines.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class MedicineAgent {
  constructor() {
    this.name = 'Medicine Information Agent';
    this.icon = '💊';
    this.medicines = medicinesData;
  }

  async process({ conditions = [], symptoms = [] }) {
    await delay(500 + Math.random() * 400);

    const allTerms = [...conditions, ...symptoms].map(t => t.toLowerCase());
    const text = allTerms.join(' ');
    const relevant = [];

    const conditionMedicineMap = {
      'fever': ['paracetamol'],
      'pain': ['paracetamol', 'ibuprofen', 'diclofenac'],
      'headache': ['paracetamol', 'ibuprofen'],
      'cold': ['paracetamol', 'cetirizine'],
      'cough': ['paracetamol'],
      'allergy': ['cetirizine'],
      'acidity': ['omeprazole', 'antacid_gel', 'ranitidine'],
      'stomach': ['omeprazole', 'antacid_gel', 'metronidazole'],
      'diarrhea': ['ors', 'metronidazole'],
      'dehydration': ['ors'],
      'vomiting': ['ondansetron', 'ors'],
      'nausea': ['ondansetron'],
      'diabetes': ['metformin'],
      'blood pressure': ['amlodipine', 'losartan'],
      'hypertension': ['amlodipine', 'losartan'],
      'high bp': ['amlodipine', 'losartan'],
      'asthma': ['salbutamol'],
      'breathing': ['salbutamol'],
      'anemia': ['iron_folic'],
      'weakness': ['iron_folic', 'multivitamin'],
      'fatigue': ['iron_folic', 'multivitamin'],
      'pregnancy': ['iron_folic'],
      'worm': ['albendazole'],
      'infection': ['amoxicillin', 'azithromycin'],
      'malaria': ['chloroquine'],
      'cholesterol': ['atorvastatin'],
      'inflammation': ['ibuprofen', 'diclofenac'],
      'arthritis': ['diclofenac', 'ibuprofen'],
      'tooth': ['paracetamol', 'ibuprofen'],
      'burn': ['paracetamol'],
      'joint pain': ['diclofenac', 'ibuprofen']
    };

    const matchedMedIds = new Set();
    for (const [condition, medIds] of Object.entries(conditionMedicineMap)) {
      if (text.includes(condition)) {
        medIds.forEach(id => matchedMedIds.add(id));
      }
    }

    // Also check direct medicine name mentions
    for (const med of this.medicines) {
      const names = [med.genericName.toLowerCase(), ...med.brandNames.map(b => b.toLowerCase())];
      if (names.some(n => text.includes(n.toLowerCase()))) {
        matchedMedIds.add(med.id);
      }
    }

    // Default to common OTC medicines if nothing matched
    if (matchedMedIds.size === 0) {
      matchedMedIds.add('paracetamol');
      matchedMedIds.add('ors');
    }

    for (const id of matchedMedIds) {
      const med = this.medicines.find(m => m.id === id);
      if (med) relevant.push(med);
    }

    return {
      relevantMedicines: relevant.slice(0, 6),
      disclaimer: '⚕️ This information is for educational purposes only. Always consult a qualified healthcare professional before taking any medication. Never self-medicate for serious conditions.',
      generalAdvice: [
        'Always complete the full course of antibiotics',
        'Store medicines as directed on the label',
        'Check expiry dates before use',
        'Keep medicines away from children',
        'Inform your doctor about all medicines you take',
        'Visit a Jan Aushadhi Kendra for affordable generic medicines'
      ]
    };
  }
}
