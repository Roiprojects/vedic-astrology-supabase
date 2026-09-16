/**
 * AI-powered Vedic astrology report generator.
 * Uses Gemini (primary) → OpenAI gpt-4o-mini (fallback).
 */
import { callAI, hasAnyAIKey } from "./ai-client";

export interface BirthDetails {
  name: string;
  email: string;
  phone: string;
  dob: string;       // YYYY-MM-DD
  tob: string;       // HH:MM (24h)
  pob: string;       // city, state/country
  gender: string;
  concern?: string;
}

export interface AstrologyReport {
  nakshatra: string;
  rashi: string;
  lagna: string;
  ruling_planet: string;
  summary: string;
  problem_analysis: string;
  astrological_reason: string;
  planetary_positions: string;
  remedies: string;
  mantras: string;
  gemstone_advice: string;
  auspicious_days: string;
}

const PARASARA_SYSTEM = `You are an expert Vedic astrologer following the classical tradition of Parasara Hora Shastra (the primary authority on Jyotish), Brihat Parashara Hora Shastra, and the Lahiri/Chitra Paksha ayanamsa system (the standard ayanamsa used by the Government of India).

Your analysis must:
1. Use LAHIRI CHITRA PAKSHA ayanamsa for all sidereal calculations
2. Follow PARASARA's house significations (Bhava Karakas) as described in Brihat Parasara Hora Shastra
3. Reference classical yogas, doshas, and dashas from Parasara's system
4. Quote or reference specific shlokas or principles from Parasara Hora Shastra when relevant
5. Apply the Vimshottari Dasha system as prescribed by Parasara
6. Use classical nakshatra lords from Parasara's 27-nakshatra system
7. Provide practical remedies following Parasara's prescribed upayas (mantras, gemstones, rituals, charity)

Style: Compassionate, authoritative, respectful. Use terms like "According to Parasara", "The classical texts state", "Parasara prescribes". Write in clear English that a layperson can understand.`;

export async function generateAstrologyReport(
  birth: BirthDetails,
  serviceTitle: string,
  serviceSlug: string
): Promise<AstrologyReport> {
  if (!await hasAnyAIKey()) throw new Error("No AI provider configured");

  const prompt = buildPrompt(birth, serviceTitle, serviceSlug);
  const raw = await callAI({
    systemPrompt: PARASARA_SYSTEM,
    userPrompt: prompt,
    maxTokens: 3000,
    temperature: 0.7,
    jsonMode: true,
  });

  try {
    return JSON.parse(raw) as AstrologyReport;
  } catch {
    return parseFreeText(raw);
  }
}

function buildPrompt(birth: BirthDetails, serviceTitle: string, serviceSlug: string): string {
  const dobFormatted = new Date(birth.dob).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return `Generate a detailed Vedic astrology report for the following client who has booked a consultation for: "${serviceTitle}"

CLIENT BIRTH DETAILS:
- Name: ${birth.name}
- Date of Birth: ${dobFormatted}
- Time of Birth: ${birth.tob}
- Place of Birth: ${birth.pob}
- Gender: ${birth.gender}
${birth.concern ? `- Client's specific concern: ${birth.concern}` : ""}

SERVICE BOOKED: ${serviceTitle} (${serviceSlug})

Using Lahiri Chitra Paksha ayanamsa and Parasara Hora Shastra, provide a comprehensive report in the following JSON format:

{
  "nakshatra": "Name of birth nakshatra with pada (e.g., Rohini Nakshatra, 2nd Pada)",
  "rashi": "Moon sign/Rashi in Sanskrit and English (e.g., Vrishabha / Taurus)",
  "lagna": "Ascendant/Lagna (e.g., Simha Lagna / Leo Ascendant)",
  "ruling_planet": "Nakshatra lord and current dasha/antardasha lord",
  "summary": "2-3 sentences overview of this person's chart strengths and current planetary period relevant to their concern",
  "problem_analysis": "3-4 paragraphs: Detailed analysis of the problem they are facing related to '${serviceTitle}'. Explain what planetary configurations are causing this issue. Reference specific houses, planets, aspects, and conjunctions. Mention if there are any relevant doshas (Mangal Dosha, Kaal Sarp Dosha, Pitra Dosha, etc.) affecting this area of life.",
  "astrological_reason": "2-3 paragraphs: The deeper astrological reason according to Parasara Hora Shastra. Quote relevant principles. Explain the Vimshottari Dasha operating, transits of slow-moving planets (Saturn, Jupiter, Rahu/Ketu) affecting the relevant house(s).",
  "planetary_positions": "Describe key planetary positions relevant to this concern: which planets are in which houses, any significant yogas or doshas, and how they affect the specific concern of ${serviceTitle}",
  "remedies": "4-6 specific remedies from Parasara's prescribed upayas: include rituals, puja recommendations, fasting days, charity (daan), and behavioral remedies. Be specific and practical.",
  "mantras": "2-3 specific mantras with transliteration, their deity/planet, and how many times to chant (e.g., 108 times on Fridays)",
  "gemstone_advice": "Specific gemstone(s) to wear based on Parasara's gemstone recommendations for the relevant planets, including metal, finger, and day to wear",
  "auspicious_days": "Best days/times for important actions related to their concern, muhurta advice"
}

Important: Make the analysis specific to this person's service concern (${serviceTitle}). Be compassionate but honest. Provide actionable guidance.`;
}

function parseFreeText(text: string): AstrologyReport {
  return {
    nakshatra: "To be calculated based on birth details",
    rashi: "Analysis in progress",
    lagna: "See full report below",
    ruling_planet: "See analysis",
    summary: text.slice(0, 400),
    problem_analysis: text,
    astrological_reason: "Based on Parasara Hora Shastra principles",
    planetary_positions: "Detailed chart analysis provided",
    remedies: "Please see the full report for remedies",
    mantras: "Specific mantras provided in consultation",
    gemstone_advice: "Gemstone recommendation in consultation",
    auspicious_days: "To be discussed in consultation",
  };
}
