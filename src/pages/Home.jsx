import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { currentLanguage, t } = useApp();
  const [contactForm, setContactForm] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const toastSuccessMap = {
    en: "Thank you! Your message has been sent successfully.",
    te: "ధన్యవాదాలు! మీ సందేశం విజయవంతంగా పంపబడింది.",
    hi: "धन्यवाद! आपका संदेश सफलतापूर्वक भेज दिया गया है।",
    ta: "நன்றி! உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது.",
    kn: "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ.",
    ml: "നന്ദി! നിങ്ങളുടെ സന്ദേശം വിജയകരമായി അയച്ചു.",
    bn: "ধন্যবাদ! আপনার বার্তা সফলভাবে পাঠানো হয়েছে।",
    pa: "ਧੰਨਵਾਦ! ਤੁਹਾਡਾ ਸੁਨੇਹਾ ਸਫਲਤਾਪੂਰਵਕ ਭੇਜਿਆ ਗਿਆ ਹੈ।",
    mr: "धन्यवाद! तुमचा संदेश यशस्वीरित्या पाठवला गेला आहे।",
    gu: "આભાર! તમારો સંદેશ સફળતાપૂર્વક મોકલવામાં આવ્યો છે.",
    or: "ଧନ୍ୟବାଦ! ଆପଣଙ୍କର ବାର୍ତ୍ତା ସଫଳତାର ସହିତ ପଠାଯାଇଛି |",
    ur: "شکریہ! آپ کا پیغام کامیابی کے ساتھ بھیج دیا گیا ہے۔"
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setSubmitted(true);
    setShowToast(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '' });
      setSubmitted(false);
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="premium-home">
      {/* Success Toast Alert */}
      {showToast && (
        <div className="premium-toast" id="contact-success-toast">
          <span className="toast-icon">✉️</span>
          <span className="toast-text">{toastSuccessMap[currentLanguage] || toastSuccessMap['en']}</span>
        </div>
      )}

      {/* Background Glowing Blobs */}
      <div className="aurora-container" aria-hidden="true">
        <div className="aurora-blob aurora-blob--blue" />
        <div className="aurora-blob aurora-blob--teal" />
        <div className="aurora-blob aurora-blob--purple" />
      </div>



      {/* Hero Section */}
      <main className="hero-container-premium">
        <div className="hero-text-content">
          <h1 className="hero-title-premium">
            {t('heroTitle').split('–')[0]} – <span className="text-highlight">{t('heroTitle').split('–')[1] || ''}</span>
          </h1>
          <p className="hero-subtitle-premium">
            {t('tagline')}
          </p>
        </div>



        {/* Action Button below Orb */}
        <div className="hero-action-wrapper">
          <button className="speak-button-premium" onClick={() => navigate('/chat')}>
            <span className="pulse-dot" />
            {t('startConsultation')}
          </button>
        </div>
      </main>


    </div>
  );
}
