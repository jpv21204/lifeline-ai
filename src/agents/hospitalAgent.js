import hospitalsData from '../data/hospitals.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class HospitalAgent {
  constructor() {
    this.name = 'Hospital Finder Agent';
    this.icon = '🏥';
    this.hospitals = hospitalsData;
  }

  async process({ location, specialties = [], urgency = 2, preferGovt = false }) {
    await delay(500 + Math.random() * 500);

    const loc = (location || '').toLowerCase();
    let filtered = [...this.hospitals];

    // Filter by location (city or district match)
    if (loc) {
      const locationMatched = filtered.filter(h =>
        h.city.toLowerCase().includes(loc) ||
        h.district.toLowerCase().includes(loc) ||
        h.state.toLowerCase().includes(loc)
      );
      if (locationMatched.length > 0) {
        filtered = locationMatched;
      }
    }

    // If emergency, prioritize hospitals with emergency services
    if (urgency >= 4) {
      const emergencyHospitals = filtered.filter(h => h.emergency);
      if (emergencyHospitals.length > 0) {
        filtered = emergencyHospitals;
      }
    }

    // Score each hospital
    const scored = filtered.map(h => {
      let score = 0;

      // Specialty match
      if (specialties.length > 0) {
        const matchCount = specialties.filter(s =>
          h.specialties.some(hs => hs.toLowerCase().includes(s.toLowerCase()))
        ).length;
        score += matchCount * 30;
      }

      // Rating bonus
      score += (h.rating || 3) * 5;

      // Emergency capability bonus (when urgent)
      if (urgency >= 3 && h.emergency) score += 20;

      // Government hospital preference
      if (preferGovt && (h.type === 'government' || h.type === 'phc' || h.type === 'chc')) score += 15;

      // Ayushman Bharat bonus
      if (h.ayushmanBharat) score += 10;

      // Bed availability proxy
      score += Math.min(h.beds / 10, 15);

      // Location exact match bonus
      if (loc && h.city.toLowerCase() === loc) score += 25;

      return { ...h, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    const topHospitals = scored.slice(0, 5).map(h => ({
      id: h.id,
      name: h.name,
      city: h.city,
      district: h.district,
      state: h.state,
      type: h.type,
      specialties: h.specialties,
      emergency: h.emergency,
      beds: h.beds,
      phone: h.phone,
      address: h.address,
      rating: h.rating,
      ayushmanBharat: h.ayushmanBharat,
      relevanceScore: h.score
    }));

    return {
      hospitals: topHospitals,
      totalFound: scored.length,
      searchCriteria: {
        location: location || 'All regions',
        specialties: specialties.length > 0 ? specialties : ['General'],
        urgency,
        preferGovt
      },
      tip: urgency >= 4
        ? '🚨 Showing hospitals with emergency services first. Call 108 for ambulance.'
        : '💡 Visit the nearest hospital or call 104 for health helpline.'
    };
  }
}
