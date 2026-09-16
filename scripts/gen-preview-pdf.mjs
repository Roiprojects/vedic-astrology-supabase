import { generateReportPdf } from "../server/lib/pdf-report.ts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const birth = {
  name: "Ramesh Kumar",
  email: "ramesh.kumar@example.com",
  phone: "+91 98765 43210",
  dob: "1990-05-15",
  tob: "06:30",
  pob: "Bangalore, Karnataka, India",
  gender: "Male",
  concern: "I have been facing problems in my marriage for the past 2 years. There are constant misunderstandings and lack of harmony between me and my spouse.",
};

const report = {
  nakshatra: "Rohini (4th Pada)",
  rashi: "Vrishabha (Taurus)",
  lagna: "Mesha (Aries)",
  ruling_planet: "Venus (Shukra) — currently in Mahadasha",
  summary: "Your birth chart reveals a strong Vrishabha rashi with Rohini nakshatra, ruled by the Moon. The Lagna lord Mars is placed in the 7th house which creates a direct influence on your marriage and partnerships. Venus, the karaka for marriage, is currently running its Mahadasha which brings both opportunities and challenges in relationships. The next 18 months are particularly significant for resolving relationship matters through consistent spiritual effort.",
  problem_analysis: "The placement of Mars in your 7th house (house of marriage and partnerships) creates a Mangal Dosha, which is one of the primary causes of friction and misunderstanding between spouses. Additionally, Saturn's aspect on Venus has been creating delays and obstacles in marital harmony since 2023. The 2nd house lord (family and communication) being afflicted by Rahu adds to the miscommunication and lack of peace at home.",
  astrological_reason: "According to Brihat Parasara Hora Shastra, when the 7th lord (Venus) is conjoined with a malefic or receives the aspect of Saturn, the native experiences distress in marriage. In your chart, the Navamsa (D-9) chart shows Venus in a debilitated state, indicating that karmic lessons related to partnerships are due in this lifetime. The current Venus-Saturn transit is further activating these placements until mid-2026.",
  planetary_positions: "Sun: Mesha (exalted) in 1st house — strong personality and leadership. Moon: Vrishabha in 2nd house — emotional and family-oriented. Mars: Tula in 7th house — creates relationship tensions (Mangal Dosha). Mercury: Mithuna in 3rd house — good communication potential. Jupiter: Dhanu in 9th house — blessings from elders and spiritual grace. Venus: Vrishabha in 2nd house — love for family but aspected by Saturn. Saturn: Makara in 10th house — aspect on 7th house affecting marriage. Rahu: Mithuna in 3rd house. Ketu: Dhanu in 9th house.",
  remedies: "Perform Mangal Homa on Tuesdays to pacify Mars Dosha and reduce marital conflicts.\nChant the Navgraha Stotram every morning after bath for 40 consecutive days.\nFeed jaggery and wheat to cows on Fridays to strengthen Venus and improve relationship harmony.\nLight a ghee lamp (Neyya Vilakku) in front of Lord Shiva every Monday evening with your spouse.\nWear copper ring on the right ring finger on a Tuesday after sunrise.\nOffer red flowers to Lord Murugan (Kartikeya) on Tuesdays and pray for resolution of conflicts.\nAvoid arguments on Saturdays and practice silence for at least 2 hours on that day.\nDonate red lentils (masoor dal) and jaggery to a temple on Tuesdays.",
  mantras: "Om Angarakaya Namaha\nChant 108 times daily at sunrise facing East for 41 days. This mantra pacifies Mars (Mangal) and removes the dosha affecting your marriage.",
  gemstone_advice: "Primary Stone: Red Coral (Moonga)\nFinger: Right ring finger\nMetal: Gold or Copper\nWeight: Minimum 5 carats\nDay to wear: Tuesday morning\nSecondary Stone: White Pearl (Moti)\nFinger: Right little finger\nMetal: Silver\nNote: Get the stone energized (abhisheka) by a priest before wearing.",
  auspicious_days: "Friday 22 August 2026\nMonday 25 August 2026\nFriday 29 August 2026\nWednesday 3 September 2026\nSunday 7 September 2026\nFriday 12 September 2026",
};

const buf = await generateReportPdf(birth, report, "Love & Relationship Problems");
const outPath = path.join(__dirname, "../sample-report.pdf");
fs.writeFileSync(outPath, buf);
console.log("PDF written to:", outPath);
console.log("Size:", Math.round(buf.length / 1024), "KB");
