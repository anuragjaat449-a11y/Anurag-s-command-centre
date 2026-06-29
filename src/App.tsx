import React from "react";
import { PlannerState, ChapterState, TaskState, TestResult } from "./types";
import { subjects, generateWeeklySchedule } from "./data";
import { Dashboard } from "./components/Dashboard";
import { Timetable } from "./components/Timetable";
import { Chapters } from "./components/Chapters";
import { Analytics } from "./components/Analytics";
import { Pacing } from "./components/Pacing";
import { Settings } from "./components/Settings";

// Firebase integration imports
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { AuthModal } from "./components/AuthModal";

// Key to store app state in localStorage
const LOCAL_STORAGE_KEY = "anurag_planner_v2";

export default function App() {
  const [activeTab, setActiveSubjectTab] = React.useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Authentication & cloud sync state
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [syncing, setSyncing] = React.useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = React.useState<boolean>(false);

  // Initialize planner state
  const [state, setState] = React.useState<PlannerState>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && parsed.chapters) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load local storage state", e);
    }

    // Default Fallback State
    const defaultChapters: Record<string, ChapterState> = {};
    subjects.forEach((sub) => {
      sub.chapters.forEach((ch) => {
        defaultChapters[ch.id] = {
          chapterId: ch.id,
          subject: sub.key,
          lecturesWatched: 0,
          totalLectures: ch.lectures,
          completed: false,
          testsDone: [],
          notes: ""
        };
      });
    });

    return {
      chapters: defaultChapters,
      tasks: {},
      streak: 0,
      lastStudyDate: ""
    };
  });

  // Schedule timeline (24 weeks starting from June 21, 2026)
  const schedule = React.useMemo(() => generateWeeklySchedule("2026-06-21"), []);

  // Netlify Database cloud syncing helper
  const syncToDatabase = async (nextState: PlannerState, user: User | null) => {
    if (!user) return;
    try {
      const response = await fetch("/api/planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.uid}`,
        },
        body: JSON.stringify({
          email: user.email,
          state: nextState,
        }),
      });
      if (!response.ok) {
        throw new Error(`Sync failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error("Error syncing to Netlify Database:", err);
    }
  };

  // Listen to Auth State Changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setSyncing(true);
        try {
          const response = await fetch("/api/planner", {
            headers: {
              "Authorization": `Bearer ${user.uid}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.state && data.state.chapters) {
              const cloudState: PlannerState = {
                chapters: data.state.chapters,
                tasks: data.state.tasks || {},
                streak: data.state.streak || 0,
                lastStudyDate: data.state.lastStudyDate || ""
              };
              setState(cloudState);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudState));
            } else {
              // First time login, back up local storage state to Netlify Database
              let localData = state;
              try {
                const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (parsed && typeof parsed === "object" && parsed.chapters) {
                    localData = parsed;
                  }
                }
              } catch (err) {}
              await fetch("/api/planner", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${user.uid}`,
                },
                body: JSON.stringify({
                  email: user.email,
                  state: localData,
                }),
              });
            }
          }
        } catch (err) {
          console.error("Failed to fetch cloud sync data:", err);
        } finally {
          setSyncing(false);
        }
      } else {
        // Logged out, load from localStorage
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object" && parsed.chapters) {
              setState(parsed);
            }
          }
        } catch (err) {}
      }
    });

    return () => unsubscribe();
  }, []);

  // Update localStorage helper
  const saveState = (next: PlannerState) => {
    setState(next);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    if (auth.currentUser) {
      syncToDatabase(next, auth.currentUser);
    }
  };

  // State Updaters
  const updateLectures = (chapterId: string, watched: number) => {
    const ch = state.chapters[chapterId];
    if (!ch) return;

    const nextChapters = { ...state.chapters };
    const nextWatched = Math.max(0, watched);
    const completed = nextWatched >= ch.totalLectures;

    nextChapters[chapterId] = {
      ...ch,
      lecturesWatched: nextWatched,
      completed,
      completedAt: completed && !ch.completed ? new Date().toISOString() : ch.completedAt,
      startedAt: !ch.startedAt && nextWatched > 0 ? new Date().toISOString() : ch.startedAt
    };

    saveState({ ...state, chapters: nextChapters });
  };

  const updateTotalLectures = (chapterId: string, total: number) => {
    const ch = state.chapters[chapterId];
    if (!ch) return;

    const nextChapters = { ...state.chapters };
    const nextTotal = Math.max(1, total);

    nextChapters[chapterId] = {
      ...ch,
      totalLectures: nextTotal,
      completed: ch.lecturesWatched >= nextTotal
    };

    saveState({ ...state, chapters: nextChapters });
  };

  const toggleChapterComplete = (chapterId: string) => {
    const ch = state.chapters[chapterId];
    if (!ch) return;

    const nextChapters = { ...state.chapters };
    const nextCompleted = !ch.completed;

    nextChapters[chapterId] = {
      ...ch,
      completed: nextCompleted,
      lecturesWatched: nextCompleted ? ch.totalLectures : 0,
      completedAt: nextCompleted ? new Date().toISOString() : undefined
    };

    saveState({ ...state, chapters: nextChapters });
  };

  const addTest = (chapterId: string, test: Omit<TestResult, "id">) => {
    const ch = state.chapters[chapterId];
    if (!ch) return;

    const nextChapters = { ...state.chapters };
    const newTest: TestResult = {
      ...test,
      id: `test-${Date.now()}`
    };

    nextChapters[chapterId] = {
      ...ch,
      testsDone: [...(ch.testsDone || []), newTest]
    };

    saveState({ ...state, chapters: nextChapters });
  };

  const updateTest = (chapterId: string, testId: string, updates: Partial<TestResult>) => {
    const ch = state.chapters[chapterId];
    if (!ch) return;

    const nextChapters = { ...state.chapters };
    nextChapters[chapterId] = {
      ...ch,
      testsDone: ch.testsDone.map((t) => (t.id === testId ? { ...t, ...updates } : t))
    };

    saveState({ ...state, chapters: nextChapters });
  };

  const deleteTest = (chapterId: string, testId: string) => {
    const ch = state.chapters[chapterId];
    if (!ch) return;

    const nextChapters = { ...state.chapters };
    nextChapters[chapterId] = {
      ...ch,
      testsDone: ch.testsDone.filter((t) => t.id !== testId)
    };

    saveState({ ...state, chapters: nextChapters });
  };

  const updateChapterNotes = (chapterId: string, notes: string) => {
    const ch = state.chapters[chapterId];
    if (!ch) return;

    const nextChapters = { ...state.chapters };
    nextChapters[chapterId] = {
      ...ch,
      notes
    };

    saveState({ ...state, chapters: nextChapters });
  };

  const updateTask = (blockId: string, date: string, updates: Partial<TaskState>) => {
    const taskKey = `${blockId}-${date}`;
    const existingTask = state.tasks[taskKey] || {
      date,
      blockId,
      status: "pending",
      lecturesDone: 0,
      extraLectures: 0,
      notes: "",
      subjectOverride: null
    };

    const updatedTask = {
      ...existingTask,
      ...updates
    };

    let newStreak = state.streak;
    let newLastStudyDate = state.lastStudyDate;

    const isStudiedToday =
      updatedTask.status === "done" ||
      updatedTask.status === "partial" ||
      (updatedTask.lecturesDone ?? 0) >= 1;

    const anyOtherStudiedToday = (Object.values(state.tasks) as TaskState[]).some(
      (t) =>
        t.date === date &&
        t.blockId !== blockId &&
        (t.status === "done" || t.status === "partial" || t.lecturesDone > 0)
    );

    if ((isStudiedToday || anyOtherStudiedToday) && state.lastStudyDate !== date) {
      if (state.lastStudyDate) {
        const lastDate = new Date(state.lastStudyDate);
        const currentDate = new Date(date);
        const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak = state.streak + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
      newLastStudyDate = date;
    }

    const nextState = {
      ...state,
      tasks: {
        ...state.tasks,
        [taskKey]: updatedTask
      },
      streak: newStreak,
      lastStudyDate: newLastStudyDate
    };

    saveState(nextState);
  };

  const getTask = (blockId: string, date: string): TaskState => {
    const taskKey = `${blockId}-${date}`;
    return (
      state.tasks[taskKey] || {
        date,
        blockId,
        status: "pending",
        lecturesDone: 0,
        extraLectures: 0,
        notes: "",
        subjectOverride: null
      }
    );
  };

  const getSubjectProgress = (subjectKey: string) => {
    const list = (Object.values(state.chapters) as ChapterState[]).filter((c) => c.subject === subjectKey);
    const totalLectures = list.reduce((sum, c) => sum + c.totalLectures, 0);
    const doneLectures = list.reduce((sum, c) => sum + Math.min(c.lecturesWatched, c.totalLectures), 0);
    const totalChapters = list.length;
    const doneChapters = list.filter((c) => c.completed).length;
    const pct = totalLectures > 0 ? Math.round((doneLectures / totalLectures) * 100) : 0;

    return { totalLectures, doneLectures, totalChapters, doneChapters, pct };
  };

  const getOverallProgress = () => {
    const list = Object.values(state.chapters) as ChapterState[];
    const total = list.reduce((sum, c) => sum + c.totalLectures, 0);
    const done = list.reduce((sum, c) => sum + Math.min(c.lecturesWatched, c.totalLectures), 0);
    const totalCh = list.length;
    const doneCh = list.filter((c) => c.completed).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, done, totalCh, doneCh, pct };
  };

  const getWeekSchedule = (weekNum: number) => {
    return schedule.filter((day) => day.week === weekNum);
  };

  const resetAll = () => {
    const defaultChapters: Record<string, ChapterState> = {};
    subjects.forEach((sub) => {
      sub.chapters.forEach((ch) => {
        defaultChapters[ch.id] = {
          chapterId: ch.id,
          subject: sub.key,
          lecturesWatched: 0,
          totalLectures: ch.lectures,
          completed: false,
          testsDone: [],
          notes: ""
        };
      });
    });

    const freshState = {
      chapters: defaultChapters,
      tasks: {},
      streak: 0,
      lastStudyDate: ""
    };

    saveState(freshState);
  };

  // Nav configuration
  const navigationItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "timetable", icon: "📅", label: "Timetable" },
    { id: "chapters", icon: "📚", label: "Chapters" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "pacing", icon: "🗓️", label: "Pacing Guide" },
    { id: "settings", icon: "⚙️", label: "Settings" }
  ];

  const overallProg = getOverallProgress();

  return (
    <div className="min-h-screen star-grid pb-16 lg:pb-0" style={{ background: "var(--bg-void)" }}>
      {/* Top Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          background: "rgba(10, 13, 26, 0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/src/assets/images/command_center_logo_1782709278192.jpg"
              alt="Anurag's PCM Command Logo"
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/50"
              style={{
                boxShadow: "0 0 15px rgba(108, 99, 255, 0.6)"
              }}
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="text-sm font-black text-white leading-none">Anurag's</div>
              <div className="text-[10px] leading-none text-indigo-400 font-bold tracking-wider">
                PCM COMMAND
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSubjectTab(item.id)}
                className={`nav-tab ${activeTab === item.id ? "active" : ""}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-24 progress-3d" style={{ height: 6 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${overallProg.pct}%`,
                    background: "linear-gradient(90deg, #6c63ff, #00d4ff)",
                    boxShadow: "0 0 8px rgba(108,99,255,0.5)"
                  }}
                />
              </div>
              <span className="text-xs font-bold text-indigo-400">{overallProg.pct}%</span>
            </div>

            <div className="flex items-center gap-1.5 card-extruded px-3 py-1.5">
              <span className="text-base">🔥</span>
              <span className="text-sm font-black text-white">{state.streak}</span>
            </div>

            {/* Cloud Sync Status/Action */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[10px] leading-none text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Synced
                  </span>
                  <span className="text-[11px] leading-none text-slate-300 mt-0.5 truncate max-w-[80px]" title={currentUser.email || ""}>
                    {currentUser.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={() => signOut(auth)}
                  className="btn-3d btn-ghost px-2.5 py-1.5 text-xs rounded-lg flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  title={`Sign Out (${currentUser.email})`}
                >
                  🚪 <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="btn-3d btn-primary px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(108,99,255,0.4)]"
              >
                ☁️ <span>Sync Cloud</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden btn-3d btn-ghost w-9 h-9 p-0 text-lg rounded-xl"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <nav
            className="absolute top-14 left-0 bottom-0 w-64 p-4 space-y-2 flex flex-col"
            style={{
              background: "var(--bg-surface)",
              borderRight: "1px solid rgba(255, 255, 255, 0.07)",
              boxShadow: "4px 0 20px rgba(0,0,0,0.5)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-bold uppercase tracking-widest mb-3 px-2 text-slate-500">
              Navigation
            </div>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSubjectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`nav-tab w-full justify-start ${activeTab === item.id ? "active" : ""}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <div className="divider-glow my-4" />
            <div className="px-2 space-y-1">
              <div className="text-xs text-slate-400">Syllabus Completion</div>
              <div className="progress-3d">
                <div
                  className="progress-fill"
                  style={{
                    width: `${overallProg.pct}%`,
                    background: "linear-gradient(90deg, #6c63ff, #00d4ff)"
                  }}
                />
              </div>
              <div className="text-xs font-bold text-indigo-400">{overallProg.pct}% Complete</div>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-20 lg:pt-24 min-h-screen">
        <div className="max-w-screen-2xl mx-auto pb-6">
          {activeTab === "dashboard" && (
            <Dashboard
              state={state}
              schedule={schedule}
              updateTask={updateTask}
              getTask={getTask}
              getSubjectProgress={getSubjectProgress}
              getOverallProgress={getOverallProgress}
            />
          )}
          {activeTab === "timetable" && (
            <Timetable
              state={state}
              schedule={schedule}
              getTask={getTask}
              updateTask={updateTask}
              getWeekSchedule={getWeekSchedule}
            />
          )}
          {activeTab === "chapters" && (
            <Chapters
              state={state}
              updateLectures={updateLectures}
              updateTotalLectures={updateTotalLectures}
              toggleChapterComplete={toggleChapterComplete}
              addTest={addTest}
              updateTest={updateTest}
              deleteTest={deleteTest}
              updateChapterNotes={updateChapterNotes}
              getSubjectProgress={getSubjectProgress}
            />
          )}
          {activeTab === "analytics" && (
            <Analytics
              state={state}
              schedule={schedule}
              getSubjectProgress={getSubjectProgress}
              getOverallProgress={getOverallProgress}
            />
          )}
          {activeTab === "pacing" && (
            <Pacing
              state={state}
              getSubjectProgress={getSubjectProgress}
              getOverallProgress={getOverallProgress}
            />
          )}
          {activeTab === "settings" && (
            <Settings
              state={state}
              updateTotalLectures={updateTotalLectures}
              resetAll={resetAll}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 lg:hidden z-40"
        style={{
          background: "rgba(10, 13, 26, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.07)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.5)"
        }}
      >
        <div className="flex">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubjectTab(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              style={{
                color: activeTab === item.id ? "#6c63ff" : "rgba(255, 255, 255, 0.4)",
                fontSize: "0.65rem",
                fontWeight: activeTab === item.id ? 700 : 500,
                transition: "color 0.2s ease"
              }}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating background gradient orbs for high-tech cosmic feels */}
      <div className="fixed pointer-events-none inset-0 -z-10 overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(108, 99, 255, 0.05) 0%, transparent 70%)"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 212, 255, 0.04) 0%, transparent 70%)"
          }}
        />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
