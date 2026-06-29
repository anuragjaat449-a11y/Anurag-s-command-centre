import { Subject, PacingItem, DaySchedule } from "./types";

export const physicsChapters = [
  { id: "phy-basics", name: "Basics / Foundation", lectures: 5, isBasics: true },
  { id: "phy-1", name: "Ch 1: Electric Charges & Fields", lectures: 10 },
  { id: "phy-2", name: "Ch 2: Electrostatic Potential & Capacitance", lectures: 10 },
  { id: "phy-3", name: "Ch 3: Current Electricity", lectures: 7 },
  { id: "phy-4", name: "Ch 4: Moving Charges & Magnetism", lectures: 7 },
  { id: "phy-5", name: "Ch 5: Magnetism & Matter", lectures: 4 },
  { id: "phy-6", name: "Ch 6: Electromagnetic Induction", lectures: 7 },
  { id: "phy-7", name: "Ch 7: Alternating Current", lectures: 5 },
  { id: "phy-8", name: "Ch 8: Electromagnetic Waves", lectures: 2 },
  { id: "phy-9", name: "Ch 9: Ray Optics & Optical Instruments", lectures: 4 },
  { id: "phy-9b", name: "Ch 9B: Wave Optics", lectures: 9 },
  { id: "phy-10", name: "Ch 10: Dual Nature of Radiation", lectures: 4 },
  { id: "phy-11", name: "Ch 11: Atoms", lectures: 2 },
  { id: "phy-11b", name: "Ch 11B: Nuclei", lectures: 7 },
  { id: "phy-other", name: "Other Basics / Revision Topics", lectures: 7, isBasics: true }
];

export const chemistryChapters = [
  { id: "chem-basics", name: "Basics / Foundation", lectures: 5, isBasics: true },
  { id: "chem-1", name: "Ch 1: Solutions", lectures: 7 },
  { id: "chem-2", name: "Ch 2: Electrochemistry", lectures: 7 },
  { id: "chem-3", name: "Ch 3: Chemical Kinetics", lectures: 8 },
  { id: "chem-4", name: "Ch 4: The d & f Block Elements", lectures: 5 },
  { id: "chem-5", name: "Ch 5: Coordination Compounds", lectures: 7 },
  { id: "chem-6", name: "Ch 6: Haloalkanes & Haloarenes", lectures: 2 },
  { id: "chem-7", name: "Ch 7: Alcohols, Phenols & Ethers", lectures: 1 },
  { id: "chem-8", name: "Ch 8: Aldehydes, Ketones & Carboxylic Acids", lectures: 7 },
  { id: "chem-9", name: "Ch 9: Amines", lectures: 9 },
  { id: "chem-10", name: "Ch 10: Biomolecules", lectures: 3 }
];

export const mathChapters = [
  { id: "math-basics", name: "Basics / Foundation", lectures: 5, isBasics: true },
  { id: "math-1", name: "Ch 1: Relations & Functions", lectures: 10 },
  { id: "math-2", name: "Ch 2: Inverse Trigonometric Functions", lectures: 6 },
  { id: "math-3", name: "Ch 3: Matrices", lectures: 8 },
  { id: "math-4", name: "Ch 4: Determinants", lectures: 9 },
  { id: "math-5", name: "Ch 5: Continuity & Differentiability", lectures: 10 },
  { id: "math-6", name: "Ch 6: Application of Derivatives", lectures: 9 },
  { id: "math-7", name: "Ch 7: Integrals", lectures: 12 },
  { id: "math-8", name: "Ch 8: Application of Integrals", lectures: 5 },
  { id: "math-9", name: "Ch 9: Differential Equations", lectures: 8 },
  { id: "math-10", name: "Ch 10: Vector Algebra", lectures: 7 },
  { id: "math-11", name: "Ch 11: Three Dimensional Geometry", lectures: 8 },
  { id: "math-12", name: "Ch 12: Linear Programming", lectures: 4 },
  { id: "math-13", name: "Ch 13: Probability", lectures: 9 }
];

export const englishChapters = [
  { id: "eng-1", name: "Flamingo – Prose Sections", lectures: 8 },
  { id: "eng-2", name: "Flamingo – Poetry", lectures: 6 },
  { id: "eng-3", name: "Vistas (Supplementary Reader)", lectures: 6 },
  { id: "eng-4", name: "Writing Skills & Grammar", lectures: 6 }
];

export const hindiChapters = [
  { id: "hin-1", name: "Aroh – Kavita (Poetry)", lectures: 8 },
  { id: "hin-2", name: "Aroh – Gadya (Prose)", lectures: 6 },
  { id: "hin-3", name: "Vitan (Supplementary)", lectures: 4 },
  { id: "hin-4", name: "Lekhan Kaushal (Writing)", lectures: 4 }
];

export const subjects: Subject[] = [
  { key: "physics", label: "Physics", color: "#00d4ff", glow: "rgba(0,212,255,0.25)", icon: "⚡", chapters: physicsChapters },
  { key: "chemistry", label: "Chemistry", color: "#00e5a0", glow: "rgba(0,229,160,0.25)", icon: "🧪", chapters: chemistryChapters },
  { key: "math", label: "Math", color: "#6c63ff", glow: "rgba(108,99,255,0.25)", icon: "∑", chapters: mathChapters },
  { key: "english", label: "English", color: "#ffb347", glow: "rgba(255,179,71,0.25)", icon: "📖", chapters: englishChapters },
  { key: "hindi", label: "Hindi", color: "#ff6b9d", glow: "rgba(255,107,157,0.25)", icon: "📝", chapters: hindiChapters }
];

export const monthlyPacing: PacingItem[] = [
  { month: "July (Weeks 1–2)", physicsChapters: 2, chemistryChapters: 2, mathChapters: 2, note: "Phase 1 — Rhythm Builder: 2 Physics, 2 Chemistry, 2 Math chapters.", phase: "1" },
  { month: "August (Weeks 3–6)", physicsChapters: 2, chemistryChapters: 2, mathChapters: 2, note: "Phase 1→2 transition. Ch2–Ch3 Physics, Ch2–Ch3 Chem. Pace increases.", phase: "1→2" },
  { month: "September (Weeks 7–11)", physicsChapters: 3, chemistryChapters: 3, mathChapters: 3, note: "Phase 2 Full Sprint — 2 lectures/session. Ch4–Ch6 Physics, Ch4–Ch6 Chem, Ch3–Ch5 Math.", phase: "2" },
  { month: "October (Weeks 12–16)", physicsChapters: 3, chemistryChapters: 3, mathChapters: 3, note: "Deep execution. Ch7–Ch9 Physics, Ch7–Ch9 Chem, Ch6–Ch8 Math. Friday/Sat Spaced Recall.", phase: "2" },
  { month: "November (Weeks 17–21)", physicsChapters: 4, chemistryChapters: 2, mathChapters: 4, note: "Final push. Ch9B–Ch11B Physics, Ch10 Chem. Ch9–Ch12 Math. Spaced Recall intensive.", phase: "2" },
  { month: "December Wk 1 (Buffer)", physicsChapters: 0, chemistryChapters: 0, mathChapters: 1, note: "🎯 Full Syllabus Completion + Grand Revision. Ch13 Math + Mock Tests.", phase: "FINAL" }
];

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function generateWeeklySchedule(startDateStr: string): DaySchedule[] {
  const schedule: DaySchedule[] = [];
  const currentDate = new Date(startDateStr);
  let dayLetter: "A" | "B" = "A";

  for (let week = 1; week <= 24; week++) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dayOfWeekNum = currentDate.getDay();
      const dateStr = formatDate(currentDate);
      const phase = week <= 3 ? 1 : 2;
      const isFriday = dayOfWeekNum === 5;
      const isSaturday = dayOfWeekNum === 6;

      if (dayOfWeekNum === 0) {
        // Sunday is rest day
        schedule.push({
          date: dateStr,
          dayType: "SUNDAY",
          phase,
          week,
          dayOfWeek: "Sunday",
          isHybridDay: false,
          blocks: []
        });
      } else {
        const isHybrid = (isFriday || isSaturday) && phase === 2;
        const currentDayType = isSaturday ? "B" : dayLetter;
        const blocks: any[] = [];

        if (currentDayType === "A") {
          const physicsLectures = (phase === 1 || isHybrid) ? 1 : 2;
          blocks.push({
            id: `${dateStr}-phy`,
            label: "Physics",
            subject: "physics",
            blockType: isHybrid ? "revision" : "study",
            lecturesPlanned: physicsLectures,
            timeSlot: "Block 1"
          });
          blocks.push({
            id: `${dateStr}-math`,
            label: "Math",
            subject: "math",
            blockType: isHybrid ? "revision" : "study",
            lecturesPlanned: (phase === 1 || isHybrid) ? 1 : 2,
            timeSlot: "Block 2"
          });
        } else {
          // Day B schedule (Chemistry + Math)
          blocks.push({
            id: `${dateStr}-chem`,
            label: "Chemistry",
            subject: "chemistry",
            blockType: isHybrid ? "revision" : "study",
            lecturesPlanned: 1,
            timeSlot: "Block 1"
          });
          blocks.push({
            id: `${dateStr}-math`,
            label: "Math",
            subject: "math",
            blockType: isHybrid ? "revision" : "study",
            lecturesPlanned: (phase === 1 || isHybrid) ? 1 : 2,
            timeSlot: "Block 2"
          });
        }

        schedule.push({
          date: dateStr,
          dayType: currentDayType,
          phase,
          week,
          dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeekNum],
          isHybridDay: isHybrid,
          blocks
        });

        // Day letters alternate (but Saturday is always B, and we toggle on Mon-Fri)
        if (!isSaturday) {
          dayLetter = dayLetter === "A" ? "B" : "A";
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return schedule;
}
