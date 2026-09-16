import type { Service } from "./types";

const commonReceive = [
  "Personal consultation with Guruji",
  "Analysis of your birth chart (kundli) for this concern",
  "Clear, honest guidance in simple language",
  "Practical remedies, mantras and spiritual measures",
  "Suggested homam or pooja if required",
  "Follow-up instructions for lasting results",
];

const bookingFaq = {
  question: "How do I book this consultation?",
  answer:
    "Fill the enquiry form on this page with your birth details and question. Guruji reviews your details and confirms a consultation slot.",
};

const confidentialFaq = {
  question: "Is my information kept confidential?",
  answer:
    "Yes. Your birth details and everything you share stay strictly private and are used only to prepare your guidance.",
};

export const services: Service[] = [
  {
    slug: "love-relationship-problems",
    title: "Love & Relationship Problems",
    categorySlug: "astrology-consultations",
    icon: "💖",
    image: "/images/services/love-relationship.jpg",
    gradient: "from-rose-500/30 to-fuchsia-600/30",
    shortDescription:
      "Understand love compatibility, resolve misunderstandings, and bring harmony to your relationship.",
    fullDescription:
      "Relationships flourish when planetary energies between two people are in balance. Through careful analysis of Venus and the 7th house, Guruji reveals the root cause of misunderstandings, emotional distance, or repeated conflict — and guides you with Vedic remedies to restore love, trust, and understanding.",
    problem:
      "Frequent arguments, emotional distance, one-sided love, doubts about compatibility, or a relationship that keeps hitting the same wall can leave you anxious and confused. Vedic astrology looks beyond the surface to the planetary influences shaping your bond.",
    price: 2000,
    duration: "20–30 min consultation",
    analysis: [
      "Venus (love & attraction) and 7th house (partnership) analysis",
      "Relationship compatibility and guna matching",
      "Timing of harmony and difficult transit periods",
      "Doshas affecting love and intimacy",
      "Remedies to strengthen understanding and trust",
    ],
    receive: commonReceive,
    benefits: [
      "Clarity on compatibility and long-term potential",
      "Solutions for recurring misunderstandings",
      "Remedies to attract and stabilize love",
    ],
    remedies: [
      "Venus-strengthening mantras and gemstone guidance",
      "Specific pooja / homam if indicated",
      "Simple daily spiritual practices for harmony",
    ],
    faqs: [
      {
        question: "Can you tell if my relationship will work out?",
        answer:
          "Astrology gives indicative guidance on compatibility and favourable periods. Guruji offers honest insights and remedies, but your choices and effort matter most.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: true,
    order: 1,
    active: true,
  },
  {
    slug: "marriage-delay-divorce-issues",
    title: "Marriage Delay & Divorce Issues",
    categorySlug: "astrology-consultations",
    icon: "💍",
    image: "/images/services/marriage-delay.jpg",
    gradient: "from-amber-500/30 to-rose-600/30",
    shortDescription:
      "Guidance for late marriage, Manglik dosha, and restoring marital harmony.",
    fullDescription:
      "Delays in marriage or strain within one often trace back to Manglik dosha, afflicted 7th house lords, or difficult Saturn/Rahu influences. Guruji examines your chart to identify obstacles and recommends time-tested remedies to open the path to marriage and peace within it.",
    problem:
      "Marriage proposals falling through, unexplained delays, family pressure, or a marriage under constant strain can be deeply stressful. Understanding the planetary cause brings both relief and a way forward.",
    price: 2500,
    duration: "25–35 min consultation",
    analysis: [
      "Manglik (Mangal) dosha detection and severity",
      "7th house, Venus and Jupiter marriage indicators",
      "Late-marriage yogas and favourable marriage periods",
      "Compatibility and dosha cancellation checks",
      "Remedies for marital harmony",
    ],
    receive: commonReceive,
    benefits: [
      "Know the real reason behind marriage delay",
      "Manglik dosha clarity and remedies",
      "Guidance to restore harmony in an existing marriage",
    ],
    remedies: [
      "Mangal Dosha remedies and recommended homam",
      "Auspicious timing (muhurta) guidance",
      "Mantras and vrat for a smooth married life",
    ],
    faqs: [
      {
        question: "I am Manglik — is that a serious problem?",
        answer:
          "Manglik dosha varies in strength and is often cancelled by other placements. Guruji assesses the actual severity and suggests remedies — it is rarely a reason for fear.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: true,
    order: 2,
    active: true,
  },
  {
    slug: "career-confusion-job-problems",
    image: "/images/services/career-confusion.jpg",
    title: "Career Confusion & Job Problems",
    categorySlug: "astrology-consultations",
    icon: "💼",
    gradient: "from-sky-500/30 to-indigo-600/30",
    shortDescription:
      "Find your ideal career direction and overcome job instability or fear of loss.",
    fullDescription:
      "Your 10th house, along with the Sun and Saturn, holds the blueprint of your professional life. Guruji analyses these to reveal your natural strengths, favourable career fields, and the periods when growth, change, or caution is advised.",
    problem:
      "Feeling stuck, repeated job changes, fear of losing your position, or confusion about which path to choose can drain your confidence. Vedic astrology points to the direction where you will truly thrive.",
    price: 2000,
    duration: "25–35 min consultation",
    analysis: [
      "10th house (career), Sun (authority) and Saturn (discipline) analysis",
      "Best-suited career fields and skills",
      "Dasha and transit timing for job change or promotion",
      "Obstacles causing instability or delays",
      "Remedies to strengthen career growth",
    ],
    receive: commonReceive,
    benefits: [
      "Clarity on the right career direction",
      "Timing for job change, promotion or business",
      "Remedies to remove career blockages",
    ],
    remedies: [
      "Saturn and Sun strengthening remedies",
      "Career-focused homam if indicated",
      "Mantras and disciplines for steady growth",
    ],
    faqs: [
      {
        question: "Can astrology tell me which field is best for me?",
        answer:
          "Your chart highlights natural aptitudes and favourable fields. Guruji combines this with practical guidance so you can make confident, grounded decisions.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: true,
    order: 3,
    active: true,
  },
  {
    slug: "financial-instability-debt-problems",
    image: "/images/services/financial-instability.jpg",
    title: "Financial Instability & Debt Problems",
    categorySlug: "astrology-consultations",
    icon: "💰",
    gradient: "from-emerald-500/30 to-amber-600/30",
    shortDescription:
      "Break wealth blockages, find debt relief, and stabilize your finances.",
    fullDescription:
      "Wealth flows through Jupiter, Venus and Mercury, supported by the 2nd and 11th houses. When these are afflicted, money slips away or debt accumulates. Guruji identifies the blockage and prescribes remedies to invite stability and abundance.",
    problem:
      "Money that never seems to stay, mounting debt, blocked income, or repeated financial setbacks create constant worry. Understanding the planetary pattern is the first step to changing it.",
    price: 2500,
    duration: "30 min consultation",
    analysis: [
      "Jupiter, Venus and Mercury (wealth) analysis",
      "2nd house (savings) and 11th house (gains) review",
      "Causes of wealth blockage and financial leakage",
      "Debt-relief timing and favourable periods",
      "Remedies to attract and retain wealth",
    ],
    receive: commonReceive,
    benefits: [
      "Identify what is blocking your money flow",
      "Practical guidance for debt relief",
      "Remedies to attract steady abundance",
    ],
    remedies: [
      "Lakshmi Kubera pooja / homam guidance",
      "Wealth mantras and charitable measures",
      "Gemstone and daily practice suggestions",
    ],
    faqs: [
      {
        question: "Will astrology help me clear my debt?",
        answer:
          "Astrology reveals favourable periods and remedies to ease financial pressure, but it works best alongside disciplined planning. Guruji guides you on both.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 4,
    active: true,
  },
  {
    slug: "family-conflicts-domestic-issues",
    image: "/images/services/family-conflicts.jpg",
    title: "Family Conflicts & Domestic Issues",
    categorySlug: "astrology-consultations",
    icon: "🏡",
    gradient: "from-teal-500/30 to-purple-600/30",
    shortDescription:
      "Restore peace at home and heal parental or domestic conflict.",
    fullDescription:
      "The 4th house and the Moon govern home, mother, and emotional peace. When disturbed, family harmony suffers. Guruji examines these influences to uncover the source of tension and recommends remedies to bring warmth and understanding back home.",
    problem:
      "Constant friction at home, disputes between family members, or a heavy, restless atmosphere affects everyone. Vedic astrology helps identify and soothe the underlying planetary causes.",
    price: 2000,
    duration: "20–30 min consultation",
    analysis: [
      "4th house (home & peace) and Moon (emotions) analysis",
      "Planetary causes of family tension",
      "Parental and generational conflict indicators",
      "Favourable periods for reconciliation",
      "Remedies for domestic harmony",
    ],
    receive: commonReceive,
    benefits: [
      "Understand the root of ongoing conflict",
      "Guidance to restore peace and warmth",
      "Remedies for a harmonious home",
    ],
    remedies: [
      "Moon-strengthening remedies and mantras",
      "Peace-giving pooja / homam if indicated",
      "Simple household spiritual practices",
    ],
    faqs: [
      {
        question: "Can remedies really improve family relationships?",
        answer:
          "Remedies calm afflicted energies and support a more peaceful atmosphere. Combined with patience and understanding, many families notice a real shift.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 5,
    active: true,
  },
  {
    slug: "mental-stress-anxiety-depression",
    image: "/images/services/mental-stress.jpg",
    title: "Mental Stress, Anxiety & Depression",
    categorySlug: "astrology-consultations",
    icon: "🧘",
    gradient: "from-indigo-500/30 to-cyan-600/30",
    shortDescription:
      "Find emotional peace through Moon–Saturn analysis and spiritual remedies.",
    fullDescription:
      "The Moon governs the mind and Saturn governs fear and heaviness. A difficult Moon–Saturn relationship can create persistent worry, low mood, or restlessness. Guruji offers gentle spiritual guidance and remedies to bring calm and inner balance.",
    problem:
      "Ongoing anxiety, overthinking, low energy, or a heavy mind can feel isolating. Vedic astrology and spiritual remedies offer a supportive path toward peace — alongside, never instead of, professional care where needed.",
    price: 2000,
    duration: "25 min consultation",
    analysis: [
      "Moon (mind) and Saturn (fear/heaviness) analysis",
      "Chandra dosha and mental-peace indicators",
      "Challenging transit and dasha periods",
      "Spiritual causes of restlessness",
      "Peace-giving remedies and practices",
    ],
    receive: commonReceive,
    benefits: [
      "Understand planetary influences on your mind",
      "Calming mantras and spiritual practices",
      "A supportive, compassionate consultation",
    ],
    remedies: [
      "Moon-strengthening and peace mantras",
      "Maha Mrityunjaya / Chandra homam guidance",
      "Meditation and daily grounding practices",
    ],
    faqs: [
      {
        question: "Is this a substitute for medical treatment?",
        answer:
          "No. Astrological guidance is spiritual and supportive. For medical concerns including anxiety or depression, please also consult qualified health professionals.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 6,
    active: true,
  },
  {
    slug: "health-wellness-astrology",
    image: "/images/services/health-wellness.jpg",
    title: "Health & Wellness Astrology",
    categorySlug: "astrology-consultations",
    icon: "🌿",
    gradient: "from-lime-500/30 to-emerald-600/30",
    shortDescription:
      "Astrological indications for health, vitality, and wellbeing with supportive remedies.",
    fullDescription:
      "The 6th house, Ascendant, and planets like Sun, Moon and Saturn offer indications about vitality and health tendencies. Guruji highlights areas to care for and recommends spiritual remedies to support your wellbeing.",
    problem:
      "Recurring health concerns, low vitality, or a wish to strengthen wellbeing lead many to seek astrological indications. This guidance complements — and never replaces — proper medical care.",
    price: 2500,
    duration: "25–30 min consultation",
    analysis: [
      "Ascendant, 6th house and health-significator planets",
      "Vitality and constitution indicators",
      "Challenging periods to stay cautious",
      "Doshas linked to wellbeing",
      "Supportive spiritual remedies",
    ],
    receive: commonReceive,
    benefits: [
      "Awareness of health tendencies in your chart",
      "Supportive remedies for vitality",
      "Guidance on favourable periods for care",
    ],
    remedies: [
      "Dhanvantari / Maha Mrityunjaya homam guidance",
      "Health-supporting mantras and practices",
      "Charity and lifestyle suggestions",
    ],
    faqs: [
      {
        question: "Can astrology diagnose my illness?",
        answer:
          "Astrology gives indicative tendencies, not medical diagnosis. Always consult a doctor for diagnosis and treatment; Guruji's guidance is spiritual support.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 7,
    active: true,
  },
  {
    slug: "education-exam-success",
    image: "/images/services/education-exam.jpg",
    title: "Education & Exam Success",
    categorySlug: "astrology-consultations",
    icon: "📚",
    gradient: "from-yellow-500/30 to-orange-600/30",
    shortDescription:
      "Improve focus, overcome learning obstacles, and succeed in studies and exams.",
    fullDescription:
      "Mercury, Jupiter and the 4th/5th houses shape learning, memory and academic success, with Saraswati's blessings for knowledge. Guruji analyses these to help students overcome concentration issues and study obstacles.",
    problem:
      "Difficulty concentrating, exam anxiety, or a bright student who cannot show results — these often have planetary influences that can be gently strengthened with the right guidance.",
    price: 2000,
    duration: "20–25 min consultation",
    analysis: [
      "Mercury (intellect) and Jupiter (wisdom) analysis",
      "4th & 5th house education indicators",
      "Concentration and memory obstacles",
      "Favourable periods for exams and admissions",
      "Saraswati-related remedies",
    ],
    receive: commonReceive,
    benefits: [
      "Guidance to improve focus and memory",
      "Support for exam confidence",
      "Remedies for academic success",
    ],
    remedies: [
      "Saraswati homam and mantra guidance",
      "Study-supporting spiritual practices",
      "Favourable timing for important exams",
    ],
    faqs: [
      {
        question: "Which remedies help students the most?",
        answer:
          "Saraswati mantras, a strengthened Mercury/Jupiter, and disciplined routines help most. Guruji tailors remedies to the student's chart.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 8,
    active: true,
  },
  {
    slug: "business-growth-partnership-problems",
    image: "/images/services/business-growth.jpg",
    title: "Business Growth & Partnership Problems",
    categorySlug: "astrology-consultations",
    icon: "📈",
    gradient: "from-orange-500/30 to-red-600/30",
    shortDescription:
      "Grow your business, resolve partnership issues, and time key decisions well.",
    fullDescription:
      "Business success is shaped by the 7th house (partnerships), 10th house (profession), and wealth planets. Guruji analyses these to guide expansion, resolve partner disputes, and choose auspicious timing for important moves.",
    problem:
      "Stalled growth, unreliable partners, or uncertainty about expanding can put your livelihood at risk. Vedic timing and remedies help you act with confidence.",
    price: 3000,
    duration: "30–40 min consultation",
    analysis: [
      "7th house (partnership) and 10th house (business) analysis",
      "Wealth and growth yogas",
      "Partnership compatibility and dispute causes",
      "Auspicious timing for launches and deals",
      "Remedies to accelerate growth",
    ],
    receive: commonReceive,
    benefits: [
      "Clarity on partnership decisions",
      "Timing for expansion and key deals",
      "Remedies to remove business obstacles",
    ],
    remedies: [
      "Lakshmi Kubera / Ganapathi homam guidance",
      "Business-strengthening mantras",
      "Auspicious muhurta for important steps",
    ],
    faqs: [
      {
        question: "Can you help me choose a good business partner?",
        answer:
          "Guruji can assess partnership compatibility and favourable timing from both charts where available, helping you decide with greater clarity.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 9,
    active: true,
  },
  {
    slug: "property-legal-court-case-guidance",
    image: "/images/services/property-legal.jpg",
    title: "Property, Legal & Court Case Guidance",
    categorySlug: "astrology-consultations",
    icon: "⚖️",
    gradient: "from-slate-500/30 to-purple-700/30",
    shortDescription:
      "Guidance for property delays, legal stress, and court matters.",
    fullDescription:
      "Property and legal matters are governed by the 4th house (property), Mars, and Saturn (delays, disputes, discipline). Guruji analyses these to indicate favourable periods and remedies for property purchases, disputes, and court cases.",
    problem:
      "Blocked property deals, prolonged legal battles, or the stress of a court case can weigh heavily. Vedic astrology highlights favourable timing and remedies to ease the path.",
    price: 3000,
    duration: "30–40 min consultation",
    analysis: [
      "4th house (property) analysis",
      "Mars and Saturn (disputes, delays) review",
      "Favourable periods for property and legal matters",
      "Doshas contributing to obstacles",
      "Remedies for resolution and relief",
    ],
    receive: commonReceive,
    benefits: [
      "Guidance on property purchase or sale timing",
      "Support and remedies for legal stress",
      "Clarity on favourable and cautious periods",
    ],
    remedies: [
      "Sudarshana / Navagraha homam guidance",
      "Mars & Saturn pacifying remedies",
      "Mantras and charity for legal relief",
    ],
    faqs: [
      {
        question: "Can astrology tell me if I will win my case?",
        answer:
          "Astrology indicates favourable and difficult periods and offers remedies, but outcomes also depend on facts and legal process. Guruji offers honest, supportive guidance.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 10,
    active: true,
  },
  {
    slug: "jataka-matching-kundali-compatibility",
    image: "/images/services/jataka-matching.jpg",
    title: "Jataka Matching & Kundali Compatibility",
    categorySlug: "astrology-consultations",
    icon: "💑",
    gradient: "from-rose-400/30 to-amber-500/30",
    shortDescription:
      "Detailed kundali matching for marriage compatibility — doshas, guna milan, and auspicious timing.",
    fullDescription:
      "Jataka matching goes beyond a simple guna score. Guruji analyses both charts for Manglik dosha, Nadi dosha, matching of Moon signs, Venus, and key houses to give an honest, detailed compatibility reading before marriage.",
    problem:
      "Families and couples want to be sure their charts are compatible before committing to marriage. A superficial matching can miss important doshas or wrongly reject a compatible pair. Guruji provides clarity.",
    price: 2500,
    duration: "30–40 min consultation",
    analysis: [
      "Guna milan (Ashtakuta) score and details",
      "Manglik dosha check for both charts",
      "Nadi, Bhakoot and Gana dosha evaluation",
      "7th house and Venus compatibility",
      "Auspicious periods for marriage (muhurta guidance)",
    ],
    receive: commonReceive,
    benefits: [
      "Honest compatibility verdict with reasoning",
      "Identification and remedy for doshas",
      "Guidance on auspicious marriage timing",
    ],
    remedies: [
      "Dosha-cancellation remedies if required",
      "Recommended homam before the wedding",
      "Auspicious muhurta suggestions",
    ],
    faqs: [
      {
        question: "Do both partners need to be present?",
        answer:
          "No. Guruji needs the birth details (date, time, place) of both individuals. The consultation can be with one partner.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: true,
    order: 11,
    active: true,
  },
  {
    slug: "marriage-date-prediction",
    image: "/images/services/marriage-date.jpg",
    title: "Marriage Date Prediction",
    categorySlug: "astrology-consultations",
    icon: "📅",
    gradient: "from-pink-500/30 to-amber-400/30",
    shortDescription:
      "Know your likely marriage period, auspicious date and day from your birth chart.",
    fullDescription:
      "Using dasha, antardasha and transit analysis, Guruji identifies the most likely period, year, and even auspicious dates/days for your marriage — along with practical guidance on timing your search or proposal.",
    problem:
      "Wondering when you will get married or whether this is the right year can be stressful. A careful chart reading reveals the timing windows and what to do to support them.",
    price: 2500,
    duration: "20–30 min consultation",
    analysis: [
      "7th house lord dasha and antardasha timing",
      "Venus and Jupiter transit periods",
      "Favourable years and months for marriage",
      "Auspicious marriage date and day identification",
      "Obstacles to be addressed in the near term",
    ],
    receive: [
      "Predicted marriage period (year/month range)",
      "Auspicious date and day recommendations",
      "Practical guidance on next steps",
      "Remedies to support timely marriage",
      "Follow-up instructions",
    ],
    benefits: [
      "Know when to expect or plan your marriage",
      "Auspicious date and day guidance",
      "Remedies to remove delays",
    ],
    remedies: [
      "Mangal / Venus strengthening remedies",
      "Specific vrat or mantra for marriage blessing",
      "Homam guidance if transit is challenging",
    ],
    faqs: [
      {
        question: "Can astrology give me an exact date?",
        answer:
          "Astrology gives the most favourable windows (year, month range) and auspicious dates within them. Exact certainty is not possible, but the guidance is highly indicative.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 12,
    active: true,
  },
  {
    slug: "janna-jataka-comprehensive-birth-chart",
    image: "/images/services/janna-jataka.jpg",
    title: "Janna Jataka — Full Birth Chart Analysis",
    categorySlug: "astrology-consultations",
    icon: "🌟",
    gradient: "from-gold-light/30 to-saffron/30 bg-gradient-to-br from-amber-400/30 to-orange-500/30",
    shortDescription:
      "Complete life reading from your birth chart — all life areas, problems and remedies in one session.",
    fullDescription:
      "Janna Jataka is a comprehensive reading of your entire birth chart. Guruji examines all 12 houses, major dashas, and key yogas to give you a complete picture of your life — strengths, challenges, timing for major events, and remedies for each area.",
    problem:
      "Many people want a holistic view of their chart rather than focusing on just one problem. This full reading covers career, relationships, health, finances, and life purpose in one thorough session.",
    price: 3500,
    duration: "45–60 min consultation",
    analysis: [
      "All 12 houses — career, love, health, wealth, family",
      "Lagna (Ascendant) and life-purpose indicators",
      "Major dasha periods and what they mean for you",
      "Key yogas — auspicious and challenging",
      "Doshas present and their relative strength",
      "Remedies for each identified challenge area",
    ],
    receive: [
      "Full verbal analysis of all major life areas",
      "Written summary of key findings sent by email",
      "Personalised remedies for each challenge",
      "Timing guidance for important decisions",
      "30-day email follow-up for questions",
    ],
    benefits: [
      "Complete life clarity from a single session",
      "Understand your strengths and life purpose",
      "Personalised remedies for all challenge areas",
    ],
    remedies: [
      "Multi-planet strengthening remedies as needed",
      "Tailored mantra and charity guidance",
      "Recommended homam sequence if indicated",
    ],
    faqs: [
      {
        question: "How is this different from a regular consultation?",
        answer:
          "A regular consultation focuses on one area. Janna Jataka covers your entire chart holistically — all life areas, all dashas, all doshas — in a single in-depth session.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: true,
    order: 13,
    active: true,
  },
  {
    slug: "family-children-prediction",
    image: "/images/services/family-children.jpg",
    title: "Family & Children Prediction",
    categorySlug: "astrology-consultations",
    icon: "👨‍👩‍👧‍👦",
    gradient: "from-teal-400/30 to-emerald-600/30",
    shortDescription:
      "Guidance on children, family harmony and parenting using both spouses' birth charts.",
    fullDescription:
      "For married couples, Guruji analyses both charts to address questions about children — timing, number, gender indications, and any obstacles. Family harmony, parenting challenges, and blessings for the household are also covered.",
    problem:
      "Delays in having children, concerns about the family's wellbeing, or questions about parenthood timing often have astrological explanations. Using both spouses' charts provides the most complete picture.",
    price: 2500,
    duration: "30–40 min consultation",
    analysis: [
      "5th house (children) analysis for both spouses",
      "Jupiter (children, blessings) placement and strength",
      "Timing of children — dasha and transit windows",
      "Obstacles to conception or family harmony",
      "Remedies to support family blessings",
    ],
    receive: [
      "Children timing guidance (likely windows)",
      "Family harmony remedies",
      "Mantras and pooja for blessings",
      "Practical follow-up guidance",
      "Email support after the session",
    ],
    benefits: [
      "Clarity on children timing and prospects",
      "Remedies for delays or complications",
      "Family harmony and parenting guidance",
    ],
    remedies: [
      "Santana Gopala homam guidance",
      "Jupiter-strengthening remedies",
      "Vrat and mantra for children blessings",
    ],
    faqs: [
      {
        question: "Do both husband and wife need to share birth details?",
        answer:
          "For the most accurate reading, both partners' birth details are needed. Guruji can work with one chart if the other is unavailable, but the two-chart reading is more comprehensive.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 14,
    active: true,
  },
  {
    slug: "gemstone-recommendation",
    image: "/images/services/gemstone.jpg",
    title: "Gemstone Recommendation",
    categorySlug: "astrology-consultations",
    icon: "💎",
    gradient: "from-cyan-400/30 to-blue-600/30",
    shortDescription:
      "Personalised gemstone guidance based on your birth chart to strengthen favourable planets.",
    fullDescription:
      "Vedic gemstones (ratnas) are worn to strengthen benefic planets in your chart. Guruji examines your chart to recommend the right stone, metal, weight, and finger — and equally important, which stones to avoid.",
    problem:
      "Wearing the wrong gemstone can aggravate malefic planets and cause harm. Many people wear stones based on sun sign alone, which is inaccurate. A proper chart-based recommendation is essential.",
    price: 2500,
    duration: "20 min consultation",
    analysis: [
      "Lagna lord and benefic planet identification",
      "Stones to strengthen and stones to avoid",
      "Correct weight (ratti), metal and setting",
      "Which finger and which hand",
      "Activation (energisation) guidance",
    ],
    receive: [
      "Written gemstone recommendation by email",
      "Stones to wear and stones to strictly avoid",
      "Wearing procedure and activation mantra",
      "Where to source quality certified gems (guidance)",
      "Follow-up support via email",
    ],
    benefits: [
      "Strengthen the right planets for your chart",
      "Avoid harmful stones that weaken your chart",
      "Simple, practical guidance with full details",
    ],
    remedies: [
      "Primary gemstone recommendation with full details",
      "Substitute (upratna) option if primary is costly",
      "Activation mantra and day of wearing",
    ],
    faqs: [
      {
        question: "Which gemstone is best for me?",
        answer:
          "It depends entirely on your birth chart. There is no one-size-fits-all answer. Guruji recommends only chart-appropriate stones — and advises which to avoid.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 15,
    active: true,
  },
  {
    slug: "rahu-kuja-dosha-analysis",
    image: "/images/services/rahu-kuja-dosha.jpg",
    title: "Rahu & Kuja (Mars) Dosha Analysis",
    categorySlug: "astrology-consultations",
    icon: "🔥",
    gradient: "from-red-600/30 to-violet-700/30",
    shortDescription:
      "Detailed assessment of Rahu dosha and Kuja (Manglik) dosha — severity, effects and remedies.",
    fullDescription:
      "Rahu and Kuja (Mars) are among the most talked-about planets when it comes to doshas. Guruji conducts a thorough analysis of both to determine their actual strength in your chart, the areas they affect, and the specific remedies to pacify them.",
    problem:
      "Fear about Rahu dosha or Manglik dosha is common, but their severity varies greatly from chart to chart. Many doshas are partially or fully cancelled by other placements. Guruji gives you the honest picture — no unnecessary fear.",
    price: 2500,
    duration: "30 min consultation",
    analysis: [
      "Rahu position, strength and dosha assessment",
      "Kuja (Manglik) dosha presence and severity",
      "Cancellation factors (dosha parihara) check",
      "Houses and life areas affected",
      "Targeted remedies for each dosha",
    ],
    receive: commonReceive,
    benefits: [
      "Honest assessment — severity, not scare",
      "Clarity on cancellation of doshas",
      "Specific remedies for each dosha present",
    ],
    remedies: [
      "Rahu shanti puja / Kuja Graha shanti",
      "Rahu-Ketu or Mangal dosha homam guidance",
      "Mantras, vrat and charity for pacification",
    ],
    faqs: [
      {
        question: "Is Manglik dosha really that serious?",
        answer:
          "In most charts, Manglik dosha is partially cancelled and its effects are moderate. Guruji assesses the actual severity honestly — it is rarely a reason for alarm.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 16,
    active: true,
  },
  {
    slug: "black-magic-removal",
    image: "/images/services/black-magic-removal.jpg",
    title: "Black Magic & Negative Energy Removal",
    categorySlug: "astrology-consultations",
    icon: "🛡️",
    gradient: "from-gray-800/30 to-purple-900/30",
    shortDescription:
      "Identification and removal of black magic, evil eye, and negative energies through Vedic rituals.",
    fullDescription:
      "Some situations — repeated unexplained failures, sudden health deterioration, family discord, or nightmares — may indicate black magic or strong evil eye. Guruji assesses this through chart analysis and specific diagnostic techniques, then performs the appropriate Vedic ritual for removal and protection.",
    problem:
      "Persistent, unexplained negative patterns in life — despite remedies and effort — sometimes point to external negative influence. This service addresses such situations with discretion and powerful Vedic counter-measures.",
    price: 3500,
    duration: "Call-based assessment first",
    analysis: [
      "Chart analysis for external negative influences",
      "Evil eye (drishti) and black magic indicators",
      "Affected life areas and intensity",
      "Appropriate Vedic ritual identification",
      "Protection measures after removal",
    ],
    receive: [
      "Initial assessment call with Guruji",
      "Appropriate ritual or homam for removal",
      "Protection mantras and measures",
      "Follow-up check after the ritual",
      "Ongoing protection guidance",
    ],
    benefits: [
      "Removal of identified negative influences",
      "Spiritual protection going forward",
      "Peace of mind and restoration of energy",
    ],
    remedies: [
      "Sudarshana / Durga homam for protection",
      "Specific removal ritual as assessed",
      "Kavach (protective mantra) and daily practice",
    ],
    faqs: [
      {
        question: "How do I know if I have black magic on me?",
        answer:
          "Guruji assesses this through chart analysis and a detailed discussion. There is no charge for the initial assessment call — book a call and share your situation first.",
      },
      {
        question: "How do I book?",
        answer:
          "Fill the enquiry form and share your situation. If a ritual is needed, Guruji will guide you through the next steps.",
      },
      confidentialFaq,
    ],
    featured: false,
    order: 17,
    active: true,
  },
  {
    slug: "pitra-dosha-rahu-dasha-relief",
    image: "/images/services/pitra-dosha.jpg",
    title: "Pitra Dosha & Rahu Dasha Relief",
    categorySlug: "astrology-consultations",
    icon: "🪔",
    gradient: "from-amber-700/30 to-purple-800/30",
    shortDescription:
      "Quick dosha report and remedies for Pitra Dosha and Rahu Dasha — delivered by email in 5–10 minutes.",
    fullDescription:
      "A focused, fast analysis of Pitra Dosha (ancestral dosha) and Rahu Dasha effects on your life. Guruji assesses the presence and severity based on your birth details and sends a concise written report with targeted remedies by email.",
    problem:
      "Pitra dosha and Rahu dasha are behind many unexplained family problems, career obstacles, and recurring misfortune. A quick identification lets you act on the remedy immediately.",
    price: 2500,
    duration: "Email report within 5–10 min of receiving your details",
    analysis: [
      "Pitra dosha presence and strength",
      "Rahu dasha / antardasha current period",
      "Life areas most affected",
      "Quick dosha reason summary",
      "Targeted remedy guidance",
    ],
    receive: [
      "Written email report within 5–10 minutes",
      "Dosha reason explained clearly",
      "Specific remedies for Pitra dosha",
      "Rahu dasha pacification guidance",
      "Email support for follow-up questions",
    ],
    benefits: [
      "Fast clarity — no waiting days for a report",
      "Actionable remedies you can start immediately",
      "Affordable and focused — no lengthy session needed",
    ],
    remedies: [
      "Pitra tarpana / Narayana Bali guidance",
      "Rahu shanti mantra and donation guidance",
      "Simple immediate measures to reduce effects",
    ],
    faqs: [
      {
        question: "How quickly will I receive the report?",
        answer:
          "Guruji aims to send the email report within 5–10 minutes of receiving your birth details. During busy periods it may take up to 30 minutes.",
      },
      bookingFaq,
      confidentialFaq,
    ],
    featured: false,
    order: 18,
    active: true,
  },
];
