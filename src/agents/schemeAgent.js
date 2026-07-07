import schemesData from '../data/schemes.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class SchemeAgent {
  constructor() {
    this.name = 'Government Scheme Agent';
    this.icon = '📋';
    this.schemes = schemesData;
  }

  async process({ age, gender, income, occupation, state, conditions = [] }) {
    await delay(700 + Math.random() * 500);

    const userAge = parseInt(age) || 30;
    const userGender = (gender || '').toLowerCase();
    const userIncome = (income || '').toLowerCase();
    const userState = (state || '').toLowerCase();
    const userOccupation = (occupation || '').toLowerCase();
    const userConditions = conditions.map(c => c.toLowerCase());

    const eligible = [];
    const partial = [];

    for (const scheme of this.schemes) {
      let matchScore = 0;
      let totalCriteria = 0;
      const reasons = [];

      // Age check
      if (scheme.eligibility.ageRange) {
        totalCriteria++;
        const [minAge, maxAge] = scheme.eligibility.ageRange;
        if (userAge >= minAge && userAge <= maxAge) {
          matchScore++;
        } else {
          reasons.push(`Age requirement: ${minAge}-${maxAge} years`);
        }
      }

      // Gender check
      if (scheme.eligibility.gender && scheme.eligibility.gender !== 'All') {
        totalCriteria++;
        if (userGender.includes(scheme.eligibility.gender.toLowerCase()) || !userGender) {
          matchScore++;
        } else {
          reasons.push(`Gender requirement: ${scheme.eligibility.gender}`);
        }
      } else {
        totalCriteria++;
        matchScore++;
      }

      // State check
      if (scheme.eligibility.states) {
        totalCriteria++;
        if (scheme.eligibility.states.includes('All India')) {
          matchScore++;
        } else if (userState && scheme.eligibility.states.some(s => s.toLowerCase().includes(userState))) {
          matchScore++;
        } else if (!userState) {
          matchScore += 0.5; // Partial match if state unknown
        } else {
          reasons.push(`Available in: ${scheme.eligibility.states.join(', ')}`);
        }
      }

      // Income check
      if (scheme.eligibility.incomeLimit) {
        totalCriteria++;
        const limit = scheme.eligibility.incomeLimit.toLowerCase();
        if (limit.includes('no income limit') || limit.includes('all')) {
          matchScore++;
        } else if (userIncome && (userIncome.includes('bpl') || userIncome.includes('below poverty') || userIncome.includes('low'))) {
          matchScore++;
        } else if (!userIncome) {
          matchScore += 0.5;
        } else {
          reasons.push(`Income requirement: ${scheme.eligibility.incomeLimit}`);
        }
      }

      // Category check
      if (scheme.eligibility.categories) {
        totalCriteria++;
        if (scheme.eligibility.categories.includes('All')) {
          matchScore++;
        } else if (userIncome && scheme.eligibility.categories.some(c =>
          c.toLowerCase() === 'bpl' && (userIncome.includes('bpl') || userIncome.includes('low'))
        )) {
          matchScore++;
        } else if (!userIncome) {
          matchScore += 0.5;
        }
      }

      // Special condition matches
      if (scheme.id === 'jsy' || scheme.id === 'pmmvy') {
        if (userConditions.some(c => c.includes('pregnant') || c.includes('pregnancy')) ||
            userGender === 'female') {
          matchScore += 0.5;
        }
      }
      if (scheme.id === 'rbsk' && userAge <= 18) matchScore += 0.5;
      if (scheme.id === 'nikshay' && userConditions.some(c => c.includes('tb') || c.includes('tuberculosis'))) matchScore += 1;
      if (scheme.id === 'dialysis' && userConditions.some(c => c.includes('kidney') || c.includes('dialysis'))) matchScore += 1;
      if (scheme.id === 'nmhp' && userConditions.some(c => c.includes('mental') || c.includes('depression') || c.includes('anxiety'))) matchScore += 1;

      const matchPercent = totalCriteria > 0 ? (matchScore / totalCriteria) * 100 : 50;

      if (matchPercent >= 75) {
        eligible.push({ ...scheme, matchPercent: Math.round(matchPercent) });
      } else if (matchPercent >= 40) {
        partial.push({ ...scheme, matchPercent: Math.round(matchPercent), unmatchedReasons: reasons });
      }
    }

    // Sort by match percentage
    eligible.sort((a, b) => b.matchPercent - a.matchPercent);
    partial.sort((a, b) => b.matchPercent - a.matchPercent);

    // Collect all unique documents needed
    const allDocs = new Set();
    eligible.forEach(s => s.documentsRequired.forEach(d => allDocs.add(d)));

    return {
      eligibleSchemes: eligible,
      partiallyEligible: partial.slice(0, 5),
      totalSchemes: this.schemes.length,
      documentsNeeded: [...allDocs],
      tip: eligible.length > 0
        ? `✅ You may be eligible for ${eligible.length} government health scheme(s). Carry the required documents when applying.`
        : '💡 Please provide your income and location details for better scheme matching.'
    };
  }
}
