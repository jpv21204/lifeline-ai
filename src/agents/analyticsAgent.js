const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory analytics store
const analyticsStore = {
  symptoms: {},
  regions: {},
  ageGroups: {},
  totalQueries: 0,
  queries: []
};

export class AnalyticsAgent {
  constructor() {
    this.name = 'Analytics Agent';
    this.icon = '📊';
  }

  async process({ symptoms = [], location, age }) {
    await delay(300 + Math.random() * 300);

    // Log this query
    analyticsStore.totalQueries++;
    const timestamp = new Date().toISOString();

    // Track symptoms
    for (const s of symptoms) {
      const name = typeof s === 'string' ? s : s.name;
      if (!analyticsStore.symptoms[name]) {
        analyticsStore.symptoms[name] = { count: 0, firstSeen: timestamp };
      }
      analyticsStore.symptoms[name].count++;
      analyticsStore.symptoms[name].lastSeen = timestamp;
    }

    // Track regions
    if (location) {
      if (!analyticsStore.regions[location]) {
        analyticsStore.regions[location] = { count: 0, symptoms: {} };
      }
      analyticsStore.regions[location].count++;
      for (const s of symptoms) {
        const name = typeof s === 'string' ? s : s.name;
        analyticsStore.regions[location].symptoms[name] =
          (analyticsStore.regions[location].symptoms[name] || 0) + 1;
      }
    }

    // Track age groups
    if (age) {
      const ageGroup = age < 5 ? '0-4' : age < 18 ? '5-17' : age < 40 ? '18-39' : age < 60 ? '40-59' : '60+';
      analyticsStore.ageGroups[ageGroup] = (analyticsStore.ageGroups[ageGroup] || 0) + 1;
    }

    // Store query
    analyticsStore.queries.push({
      timestamp,
      symptoms: symptoms.map(s => typeof s === 'string' ? s : s.name),
      location,
      age
    });

    // Generate report
    const commonSymptoms = Object.entries(analyticsStore.symptoms)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([symptom, data]) => ({
        symptom,
        count: data.count,
        trend: data.count > 3 ? 'rising' : data.count > 1 ? 'stable' : 'new'
      }));

    const regionStats = Object.entries(analyticsStore.regions)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([region, data]) => ({
        region,
        queryCount: data.count,
        topSymptom: Object.entries(data.symptoms)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      }));

    const recommendations = [];
    // Generate public health recommendations
    const feverCount = analyticsStore.symptoms['Fever']?.count || 0;
    if (feverCount > 2) {
      recommendations.push('📈 Increased fever cases detected in the community. Consider awareness campaigns.');
    }
    const dengueCount = analyticsStore.symptoms['Dengue Symptoms']?.count || 0;
    if (dengueCount > 1) {
      recommendations.push('🦟 Dengue cases reported. Recommend mosquito control measures.');
    }
    if (analyticsStore.totalQueries > 5) {
      recommendations.push('📊 Community engagement is growing. Consider expanding health camp coverage.');
    }
    recommendations.push('💡 Regular health awareness sessions recommended for the community.');

    return {
      commonSymptoms,
      regionStats,
      ageDistribution: analyticsStore.ageGroups,
      totalQueries: analyticsStore.totalQueries,
      recommendations,
      lastUpdated: timestamp
    };
  }

  getStats() {
    return { ...analyticsStore };
  }
}
