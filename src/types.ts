export interface Chapter {
  id: string;
  name: string;
  lectures: number;
  isBasics?: boolean;
}

export interface Subject {
  key: string;
  label: string;
  color: string;
  glow: string;
  icon: string;
  chapters: Chapter[];
}

export interface TestResult {
  id: string;
  date: string;
  score: number;
  maxScore: number;
  type: "chapter" | "unit" | "mock" | "practice";
  notes?: string;
}

export interface ChapterState {
  chapterId: string;
  subject: string;
  lecturesWatched: number;
  totalLectures: number;
  completed: boolean;
  completedAt?: string;
  startedAt?: string;
  testsDone: TestResult[];
  notes: string;
}

export interface TaskState {
  date: string;
  blockId: string;
  status: "pending" | "done" | "partial" | "not-done";
  lecturesDone: number;
  extraLectures: number;
  notes?: string;
  subjectOverride?: string | null;
}

export interface PlannerState {
  chapters: Record<string, ChapterState>;
  tasks: Record<string, TaskState>;
  streak: number;
  lastStudyDate: string;
}

export interface PacingItem {
  month: string;
  physicsChapters: number;
  chemistryChapters: number;
  mathChapters: number;
  note: string;
  phase: string;
}

export interface Block {
  id: string;
  label: string;
  subject: string;
  blockType: "study" | "revision" | "language";
  lecturesPlanned: number;
  timeSlot: string;
}

export interface DaySchedule {
  date: string;
  dayType: "A" | "B" | "SUNDAY";
  phase: number;
  week: number;
  dayOfWeek: string;
  isHybridDay: boolean;
  blocks: Block[];
}
