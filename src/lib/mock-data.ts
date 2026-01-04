// Mock BIN Database - Maps card prefixes to tier and issuer
export const binDatabase: Record<string, { tier: string; issuer: string }> = {
  "4000": { tier: "platinum", issuer: "Chase" },
  "4111": { tier: "signature", issuer: "Bank of America" },
  "4242": { tier: "infinite", issuer: "Citi" },
  "4532": { tier: "platinum", issuer: "Wells Fargo" },
  "4916": { tier: "signature", issuer: "Capital One" },
  "4539": { tier: "infinite", issuer: "HDFC Bank" },
  "4556": { tier: "platinum", issuer: "ICICI Bank" },
  "4024": { tier: "signature", issuer: "SBI" },
  "4716": { tier: "infinite", issuer: "Axis Bank" },
};

// Benefits catalog by tier
export interface Benefit {
  id: string;
  name: string;
  category: string;
  tnc: string;
  icon: string;
}

export const benefitsByTier: Record<string, Benefit[]> = {
  platinum: [
    {
      id: "plat-1",
      name: "Complimentary Airport Lounge Access",
      category: "Travel",
      tnc: "Cardholders are entitled to complimentary access to over 1,000 airport lounges worldwide through Priority Pass. Access is limited to 4 visits per calendar year. Guest access may incur additional charges of $32 per guest per visit. Lounge access must be claimed within the same calendar year and cannot be carried forward.",
      icon: "plane",
    },
    {
      id: "plat-2",
      name: "Extended Warranty Protection",
      category: "Shopping",
      tnc: "This benefit extends the manufacturer's warranty by an additional 12 months on eligible purchases made with the card. Coverage applies to items with original manufacturer warranties of 3 years or less. Maximum coverage per item is $10,000 with an annual aggregate limit of $50,000. Claims must be filed within 60 days of product failure.",
      icon: "shield",
    },
    {
      id: "plat-3",
      name: "Dining Discounts",
      category: "Lifestyle",
      tnc: "Enjoy up to 20% off at select partner restaurants. Discount applies to food bill only and excludes beverages, taxes, and gratuity. Minimum spend of $50 required. Not valid with other offers or during special events. Reservation must be made through Visa Signature Dining portal.",
      icon: "utensils",
    },
    {
      id: "plat-4",
      name: "Purchase Protection",
      category: "Shopping",
      tnc: "Protects eligible purchases against theft or damage for 90 days from purchase date. Maximum coverage of $500 per item and $50,000 per account annually. Items must be purchased entirely with the card. Excludes vehicles, motorized equipment, and consumables.",
      icon: "shopping-bag",
    },
  ],
  signature: [
    {
      id: "sig-1",
      name: "Unlimited Airport Lounge Access",
      category: "Travel",
      tnc: "Premium cardholders receive unlimited complimentary access to over 1,300 airport lounges globally through Priority Pass Select. Includes access for the cardholder plus one guest at no additional charge. Digital membership card available through the mobile app. Advance registration required.",
      icon: "plane",
    },
    {
      id: "sig-2",
      name: "Concierge Service 24/7",
      category: "Lifestyle",
      tnc: "Access to dedicated concierge service available 24 hours a day, 7 days a week. Services include travel planning, restaurant reservations, event tickets, and special requests. Response time may vary based on request complexity. Some third-party services may incur additional charges.",
      icon: "headphones",
    },
    {
      id: "sig-3",
      name: "Golf Privileges",
      category: "Lifestyle",
      tnc: "Complimentary green fees at over 900 golf courses worldwide. Benefit includes one round per course per year. Advance booking required minimum 7 days. Cart fees and equipment rental not included. Tee time subject to availability.",
      icon: "circle",
    },
    {
      id: "sig-4",
      name: "Travel Accident Insurance",
      category: "Travel",
      tnc: "Automatic travel accident insurance coverage of up to $500,000 when travel fare is charged to the card. Coverage includes accidental death and dismemberment. Trip must be for personal travel. Coverage begins when departing from home and ends upon return.",
      icon: "heart-pulse",
    },
    {
      id: "sig-5",
      name: "Luxury Hotel Benefits",
      category: "Travel",
      tnc: "Exclusive benefits at Visa Luxury Hotel Collection properties including room upgrades when available, complimentary breakfast for two, $25 food & beverage credit, early check-in and late checkout. Minimum 2-night stay required.",
      icon: "building",
    },
  ],
  infinite: [
    {
      id: "inf-1",
      name: "Unlimited Worldwide Lounge Access",
      category: "Travel",
      tnc: "Elite cardholders receive unlimited access to over 1,500 premium airport lounges worldwide including exclusive Visa Infinite lounges. Complimentary access for cardholder plus two guests. Includes spa facilities, fine dining, and private suites where available.",
      icon: "plane",
    },
    {
      id: "inf-2",
      name: "Personal Travel Consultant",
      category: "Travel",
      tnc: "Dedicated personal travel consultant available for comprehensive trip planning. Services include flight bookings, hotel arrangements, car rentals, and curated experiences. Available Monday through Saturday, 8 AM to 10 PM. Emergency travel assistance available 24/7.",
      icon: "map",
    },
    {
      id: "inf-3",
      name: "Premium Concierge",
      category: "Lifestyle",
      tnc: "Access to elite Visa Infinite Concierge with dedicated relationship manager. Priority handling for all requests. Exclusive access to sold-out events and VIP experiences. No request too complex - from private jets to rare wine acquisition.",
      icon: "crown",
    },
    {
      id: "inf-4",
      name: "Comprehensive Travel Insurance",
      category: "Travel",
      tnc: "Complete travel insurance package including $1,000,000 travel accident coverage, trip cancellation protection up to $10,000, lost baggage coverage up to $3,000, and emergency medical coverage up to $100,000. Family members traveling together are automatically covered.",
      icon: "shield-check",
    },
    {
      id: "inf-5",
      name: "Fine Dining Experiences",
      category: "Lifestyle",
      tnc: "Exclusive access to chef's table experiences, private dining rooms, and culinary events at Michelin-starred restaurants worldwide. Complimentary appetizer or dessert at participating restaurants. Priority reservations at fully-booked establishments.",
      icon: "wine",
    },
    {
      id: "inf-6",
      name: "Luxury Shopping Benefits",
      category: "Shopping",
      tnc: "VIP shopping experiences at premium boutiques and department stores. Personal shopper services, private viewings of new collections, and exclusive member discounts up to 30% at participating luxury brands. Complimentary gift wrapping and worldwide shipping.",
      icon: "gem",
    },
  ],
};

export const tierDisplayNames: Record<string, string> = {
  platinum: "Visa Platinum",
  signature: "Visa Signature",
  infinite: "Visa Infinite",
};

export const tierColors: Record<string, { bg: string; text: string; accent: string }> = {
  platinum: {
    bg: "from-slate-400 to-slate-600",
    text: "text-slate-100",
    accent: "bg-slate-300",
  },
  signature: {
    bg: "from-amber-500 to-amber-700",
    text: "text-amber-50",
    accent: "bg-amber-300",
  },
  infinite: {
    bg: "from-slate-800 to-slate-950",
    text: "text-slate-100",
    accent: "bg-slate-400",
  },
};
