import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ta";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "nav.home": { en: "Home", ta: "முகப்பு" },
  "nav.benefits": { en: "Benefits", ta: "பலன்கள்" },
  "nav.language": { en: "தமிழ்", ta: "English" },
  
  // Home page
  "home.title": { en: "Your Smart Visa Card", ta: "உங்கள் ஸ்மார்ட் விசா கார்டு" },
  "home.subtitle": { en: "Benefit Co-Pilot", ta: "பயன் வழிகாட்டி" },
  "home.description": { 
    en: "Discover and understand your Visa card benefits with AI-powered insights", 
    ta: "AI ஆற்றலுடன் உங்கள் விசா கார்டு பயன்களை கண்டறியுங்கள்" 
  },
  "home.inputLabel": { en: "Enter your masked card number", ta: "மறைக்கப்பட்ட கார்டு எண்ணை உள்ளிடவும்" },
  "home.inputPlaceholder": { en: "4242-****-****-1234", ta: "4242-****-****-1234" },
  "home.button": { en: "Show My Benefits", ta: "என் பலன்களைக் காட்டு" },
  "home.disclaimer": { 
    en: "🔒 Security Notice: We only accept masked card numbers. No card data is stored.", 
    ta: "🔒 பாதுகாப்பு: மறைக்கப்பட்ட கார்டு எண்கள் மட்டுமே ஏற்றுக்கொள்ளப்படும். எந்த தரவும் சேமிக்கப்படாது." 
  },
  "home.error.invalid": { 
    en: "Please enter a valid masked card number (e.g., 4242-****-****-1234)", 
    ta: "சரியான மறைக்கப்பட்ட கார்டு எண்ணை உள்ளிடவும்" 
  },
  "home.error.fullCard": { 
    en: "For security, please do not enter full card numbers. Use masked format.", 
    ta: "பாதுகாப்பிற்காக, முழு கார்டு எண்களை உள்ளிட வேண்டாம்." 
  },
  
  // Card result
  "card.title": { en: "Card Identified", ta: "கார்டு அடையாளம் காணப்பட்டது" },
  "card.issuer": { en: "Issuer", ta: "வழங்கியவர்" },
  "card.tier": { en: "Card Tier", ta: "கார்டு நிலை" },
  "card.viewBenefits": { en: "View My Benefits", ta: "என் பலன்களைக் காண்க" },
  
  // Benefits page
  "benefits.title": { en: "Your Card Benefits", ta: "உங்கள் கார்டு பலன்கள்" },
  "benefits.subtitle": { en: "Exclusive perks for your", ta: "இதற்கான சிறப்புச் சலுகைகள்" },
  "benefits.aiSummary": { en: "AI Summary", ta: "AI சுருக்கம்" },
  "benefits.fullTerms": { en: "View Full Terms", ta: "முழு விதிமுறைகளைக் காண்க" },
  "benefits.personalize": { en: "Get Personalized Recommendations", ta: "தனிப்பயனாக்கப்பட்ட பரிந்துரைகளைப் பெறுங்கள்" },
  "benefits.loading": { en: "Loading AI summary...", ta: "AI சுருக்கம் ஏற்றப்படுகிறது..." },
  
  // Personalization
  "personal.title": { en: "Personalized Recommendations", ta: "தனிப்பயனாக்கப்பட்ட பரிந்துரைகள்" },
  "personal.subtitle": { en: "Tell us about yourself for tailored suggestions", ta: "தனிப்பட்ட பரிந்துரைகளுக்கு உங்களைப் பற்றி சொல்லுங்கள்" },
  "personal.lifestyle": { en: "Your Lifestyle", ta: "உங்கள் வாழ்க்கை முறை" },
  "personal.location": { en: "Location (Optional)", ta: "இடம் (விரும்பினால்)" },
  "personal.locationPlaceholder": { en: "e.g., Chennai, Mumbai", ta: "எ.கா., சென்னை, மும்பை" },
  "personal.getRecommendations": { en: "Get Top 3 Recommendations", ta: "சிறந்த 3 பரிந்துரைகளைப் பெறுங்கள்" },
  "personal.student": { en: "Student", ta: "மாணவர்" },
  "personal.professional": { en: "Professional", ta: "தொழில்முறை" },
  "personal.traveler": { en: "Traveler", ta: "பயணி" },
  "personal.family": { en: "Family", ta: "குடும்பம்" },
  
  // Recommendations
  "recommend.title": { en: "Your Top 3 Benefits", ta: "உங்கள் சிறந்த 3 பலன்கள்" },
  "recommend.rank": { en: "Rank", ta: "தரவரிசை" },
  "recommend.reason": { en: "Why this matters for you", ta: "இது உங்களுக்கு ஏன் முக்கியம்" },
  "recommend.back": { en: "Back to All Benefits", ta: "அனைத்து பலன்களுக்கும் திரும்பு" },
  
  // Common
  "common.loading": { en: "Loading...", ta: "ஏற்றுகிறது..." },
  "common.error": { en: "Something went wrong", ta: "ஏதோ தவறு நடந்தது" },
  "common.tryAgain": { en: "Try Again", ta: "மீண்டும் முயற்சிக்கவும்" },
  "common.back": { en: "Back", ta: "திரும்பு" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ta" : "en"));
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
