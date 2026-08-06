import { geminiService } from '../services/gemini.service.js';

export class MedicineAgent {
  constructor() {
    this.name = 'Medicine Information Agent';
    this.icon = '💊';
  }

  async process({ conditions = [], symptoms = [] }) {
    const terms = [...(conditions || []), ...(symptoms || [])].filter(Boolean);
    const searchTerms = terms.length > 0 ? terms : ['general discomfort'];
    const liveMedicines = [];

    // Attempt OpenFDA drug API lookup for real-time FDA label metadata
    for (const term of searchTerms.slice(0, 2)) {
      try {
        const url = `https://api.fda.gov/drug/label.json?search=indications_and_usage:${encodeURIComponent(term)}&limit=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          const openfda = result.openfda || {};
          const genericName = openfda.generic_name ? openfda.generic_name[0] : null;
          const brandName = openfda.brand_name ? openfda.brand_name[0] : null;
          
          if (genericName || brandName) {
            const cleanName = (genericName || brandName).split(' ')[0].replace(/,/g, '');
            liveMedicines.push({
              id: cleanName.toLowerCase(),
              name: cleanName,
              genericName: cleanName,
              brandNames: openfda.brand_name ? openfda.brand_name.slice(0, 3) : [cleanName],
              category: 'Therapeutic Agent (FDA Registered)',
              usage: result.indications_and_usage ? result.indications_and_usage[0].slice(0, 150) + '...' : `Relief of ${term}`,
              dosageInfo: result.dosage_and_administration ? result.dosage_and_administration[0].slice(0, 150) + '...' : 'Consult physician for precise guidelines',
              warning: result.warnings ? result.warnings[0].slice(0, 120) + '...' : 'Inform doctor of any history of allergies',
              sideEffects: ['Dizziness', 'Allergic reaction (rare)'],
              precautions: ['Consult a doctor before starting medication']
            });
          }
        }
      } catch (err) {
        console.warn("OpenFDA fetch failed for term:", term, err);
      }
    }

    // Query Gemini LLM Reasoning for symptom-specific OTC medication guidance
    const geminiResult = await geminiService.generateMedicineInfo({ conditions, symptoms: searchTerms });
    const geminiMedicines = geminiResult.medicines || [];

    // Combine and deduplicate medicines
    const combined = [...liveMedicines];
    geminiMedicines.forEach(gm => {
      const exists = combined.some(m => m.name.toLowerCase().includes(gm.name.toLowerCase()) || gm.name.toLowerCase().includes(m.name.toLowerCase()));
      if (!exists) {
        combined.push({
          id: gm.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
          name: gm.name,
          genericName: gm.name,
          brandNames: [gm.name],
          category: gm.category || 'Over-The-Counter Reference',
          usage: gm.usage,
          dosageInfo: gm.dosage,
          warning: gm.warning,
          sideEffects: gm.sideEffects || ['Mild discomfort'],
          precautions: ['Consult physician']
        });
      }
    });

    const finalMedicines = combined.length > 0 ? combined : [{
      id: 'ibuprofen',
      name: 'Ibuprofen (400mg) / Diclofenac Topical Gel',
      genericName: 'Ibuprofen / Diclofenac',
      brandNames: ['Combiflam', 'Volini Gel'],
      category: 'Anti-inflammatory / Pain Relief',
      usage: 'Relief of joint pain, knee pain, and muscular inflammation',
      dosageInfo: '1 tablet every 8 hours with meals or apply gel topically',
      warning: 'Avoid taking oral NSAIDs on an empty stomach. Consult doctor if severe.',
      sideEffects: ['Heartburn', 'Stomach irritation'],
      precautions: ['Do not exceed recommended dose']
    }];

    return {
      medicines: finalMedicines,
      relevantMedicines: finalMedicines,
      disclaimer: geminiResult.disclaimer || '⚕️ Educational reference only. Consult a physician before taking any medicine.',
      generalAdvice: geminiResult.generalAdvice || ['Consult a certified doctor for long-term pain management']
    };
  }
}
