import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import schemesData from '../data/schemes.json';
import './SchemesPage.css';

export default function SchemesPage() {
  const { t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { value: 'All', label: t('all') },
    { value: 'General Health', label: t('categoryGeneralHealth') },
    { value: 'Maternal & Child Care', label: t('categoryMaternalChild') },
    { value: 'Nutrition', label: t('categoryNutrition') },
    { value: 'Mental Health', label: t('categoryMentalHealth') },
    { value: 'Specialized Procedures', label: t('categorySpecialized') },
    { value: 'Insurance & Security', label: t('categoryInsurance') }
  ];

  const getCategory = (scheme) => {
    const name = scheme.name.toLowerCase();
    const sName = scheme.shortName.toLowerCase();
    
    if (sName === 'jsy' || sName === 'pmmvy' || sName === 'indradhanush') return 'Maternal & Child Care';
    if (sName === 'nikshay') return 'Nutrition';
    if (sName === 'nmhp') return 'Mental Health';
    if (sName === 'dialysis') return 'Specialized Procedures';
    if (sName === 'pmjay' || sName === 'aarogyasri' || sName === 'ntr vaidya seva' || sName === 'pmsby' || sName === 'esi') return 'Insurance & Security';
    return 'General Health';
  };

  const getCategoryLabel = (scheme) => {
    const catVal = getCategory(scheme);
    const catObj = categories.find(c => c.value === catVal);
    return catObj ? catObj.label : catVal;
  };

  const filteredSchemes = schemesData.filter(scheme => {
    // Search filter
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scheme.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scheme.description.toLowerCase().includes(searchTerm.toLowerCase());

    // State filter
    const matchesState = selectedState === 'All' || 
                         scheme.eligibility.states.includes('All India') ||
                         scheme.eligibility.states.some(s => s.toLowerCase() === selectedState.toLowerCase());

    // Gender filter
    const matchesGender = selectedGender === 'All' || 
                          scheme.eligibility.gender === 'All' || 
                          scheme.eligibility.gender.toLowerCase() === selectedGender.toLowerCase();

    // Category filter
    const matchesCategory = selectedCategory === 'All' || 
                            getCategory(scheme) === selectedCategory;

    return matchesSearch && matchesState && matchesGender && matchesCategory;
  });

  return (
    <div className="schemes-page-container">
      <div className="schemes-header">
        <h2>📋 {t('schemesHeader')}</h2>
        <p className="subtitle">{t('schemesSubtitle')}</p>
      </div>

      {/* Filter and search controls */}
      <div className="schemes-filters-bar glass-card">
        <div className="search-box">
          🔍 <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="selects-grid">
          <div className="filter-select-group">
            <label>{t('stateRegion')}</label>
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
              <option value="All">{t('allIndia')}</option>
              <option value="Telangana">Telangana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>{t('genderSpecific')}</label>
            <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
              <option value="All">{t('allGenders')}</option>
              <option value="Female">{t('femaleOnly')}</option>
              <option value="Male">{t('maleOnly')}</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>{t('benefitCategory')}</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map((c, idx) => (
                <option key={idx} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="schemes-results-count">
        {t('foundSchemesCount').replace('{count}', filteredSchemes.length)}
      </div>

      <div className="schemes-cards-grid">
        {filteredSchemes.map((s, idx) => (
          <div key={idx} className="scheme-info-card glass-card">
            <div className="card-top-info">
              <span className="category-label">{getCategoryLabel(s)}</span>
              <span className="coverage-amount">{s.coverageAmount || t('free')}</span>
            </div>
            
            <h3 className="scheme-title">{s.name} {s.shortName ? `(${s.shortName})` : ''}</h3>
            
            <p className="scheme-desc">{s.description}</p>
            
            <div className="eligibility-box">
              <h5>🎯 {t('eligibilityCriteria')}</h5>
              <ul>
                <li>{t('incomeLimit')} {s.eligibility.incomeLimit}</li>
                <li>{t('ageGroup')} {s.eligibility.ageRange ? `${s.eligibility.ageRange[0]} - ${s.eligibility.ageRange[1]} ${t('age').toLowerCase()}` : t('all')}</li>
                <li>{t('genderTarget')} {s.eligibility.gender === 'Female' ? t('femaleOnly') : s.eligibility.gender === 'Male' ? t('maleOnly') : t('allGenders')}</li>
                <li>{t('applicableStates')} {s.eligibility.states.map(state => state === 'All India' ? t('allIndia') : state).join(', ')}</li>
              </ul>
            </div>

            <div className="docs-box">
              <h5>📄 {t('documentsNeeded')}</h5>
              <div className="doc-pills">
                {s.documentsRequired.map((doc, docIdx) => (
                  <span key={docIdx} className="doc-pill">{doc}</span>
                ))}
              </div>
            </div>

            <div className="card-action-bar">
              {s.toll_free && (
                <span className="toll-free">📞 {t('tollFree')} <strong>{s.toll_free}</strong></span>
              )}
              {s.website && (
                <a href={s.website} target="_blank" rel="noopener noreferrer" className="btn btn-primary apply-now-btn">
                  {t('applyOnline')}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
