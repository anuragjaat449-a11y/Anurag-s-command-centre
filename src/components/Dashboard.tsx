import React from "react";
import { PlannerState, DaySchedule, ChapterState } from "../types";
import { subjects, monthlyPacing } from "../data";

interface DashboardProps {
  state: PlannerState;
  schedule: DaySchedule[];
  updateTask: (blockId: string, date: string, updates: any) => void;
  getTask: (blockId: string, date: string) => any;
  getSubjectProgress: (subjectKey: string) => any;
  getOverallProgress: () => any;
}

export const Dashboard: React.FC<DashboardProps> = ({
  state,
  schedule,
  updateTask,
  getTask,
  getSubjectProgress,
  getOverallProgress
}) => {
  const overall = getOverallProgress();
  const todayStr = new Date().toISOString().split("T")[0];
  const todaySchedule = schedule.find((d) => d.date === todayStr);

  const totalTests = (Object.values(state.chapters) as ChapterState[]).reduce(
    (acc, ch) => acc + (ch.testsDone?.length || 0),
    0
  );

  const averageScore = React.useMemo(() => {
    const allTests = (Object.values(state.chapters) as ChapterState[]).flatMap((ch) => ch.testsDone || []);
    if (!allTests.length) return 0;
    const percentages = allTests.map((t) => (t.score / t.maxScore) * 100);
    return Math.round(percentages.reduce((sum, score) => sum + score, 0) / allTests.length);
  }, [state.chapters]);

  // SVG parameters for radial gauge
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - overall.pct / 100);

  return (
    <div className="space-y-6 p-4 md:p-6 anim-fade-scale">
      {/* Header and Streak Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <img
              src="/src/assets/images/command_center_logo_1782709278192.jpg"
              alt="Logo"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-indigo-500/40"
              style={{
                boxShadow: "0 0 12px rgba(108, 99, 255, 0.4)"
              }}
              referrerPolicy="no-referrer"
            />
            Command Center
          </h1>
          <p className="text-sm mt-1 text-slate-400">
            Anurag Singh Indoliya · Class 12 PCM · Target: December 2025
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="card-extruded px-4 py-2 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-lg font-black text-white leading-none">
                {state.streak}
              </div>
              <div className="text-xs text-slate-400">Day Streak</div>
            </div>
          </div>
          <div className="card-extruded px-4 py-2 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <div>
              <div className="text-lg font-black text-white leading-none">
                {totalTests}
              </div>
              <div className="text-xs text-slate-400">Tests Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Radial Syllabus Complete Card */}
        <div className="card-3d p-6 flex flex-col items-center justify-center relative overflow-hidden" style={{ minHeight: 220 }}>
          <div className="absolute inset-0 star-grid opacity-30 pointer-events-none" />
          <div className="relative flex flex-col items-center">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="url(#overallGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
                <defs>
                  <linearGradient id="overallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6c63ff" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{overall.pct}%</span>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Complete</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-base font-bold text-white">Overall Syllabus</div>
              <div className="text-xs mt-1 text-slate-400">
                {overall.done} / {overall.total} lectures · {overall.doneCh} / {overall.totalCh} chapters
              </div>
            </div>
          </div>
        </div>

        {/* Individual Subject Progress */}
        <div className="lg:col-span-2 card-3d p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Subject Progress
          </h2>
          <div className="space-y-3 stagger">
            {subjects.map((sub) => {
              const progress = getSubjectProgress(sub.key);
              return (
                <div key={sub.key} className="anim-fade-up">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sub.icon}</span>
                      <span className="text-sm font-semibold text-white">{sub.label}</span>
                      <span
                        className="badge-3d text-xs"
                        style={{
                          color: sub.color,
                          borderColor: sub.color,
                          boxShadow: `0 0 8px ${sub.glow}`
                        }}
                      >
                        {progress.doneChapters} / {progress.totalChapters} ch
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: sub.color }}>
                      {progress.pct}%
                    </span>
                  </div>
                  <div className="progress-3d">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress.pct}%`,
                        background: `linear-gradient(90deg, ${sub.color}99, ${sub.color})`,
                        boxShadow: `0 0 10px ${sub.glow}`
                      }}
                    />
                  </div>
                  <div className="text-xs mt-1 text-slate-400 flex justify-between">
                    <span>{progress.doneLectures} / {progress.totalLectures} lectures</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        {[
          { icon: "📚", label: "Lectures Done", value: overall.done, sub: `of ${overall.total}`, color: "#6c63ff" },
          { icon: "✅", label: "Chapters Done", value: overall.doneCh, sub: `of ${overall.totalCh}`, color: "#00e5a0" },
          { icon: "🧪", label: "Tests Attempted", value: totalTests, sub: "all subjects", color: "#00d4ff" },
          { icon: "⭐", label: "Avg Test Score", value: `${averageScore}%`, sub: "across all tests", color: "#ffb347" }
        ].map((item, idx) => (
          <div key={idx} className="metric-widget anim-fade-up">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-2xl font-black" style={{ color: item.color }}>{item.value}</div>
            <div className="text-xs font-semibold text-white mt-0.5">{item.label}</div>
            <div className="text-xs mt-0.5 text-slate-400">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Plans and Monthly Pacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Plan */}
        <div className="card-3d p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
            📅 Today's Plan ({new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })})
          </h2>
          {todaySchedule ? (
            todaySchedule.dayType === "SUNDAY" ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🌟</div>
                <div className="text-white font-bold text-lg">Sunday — Rest Day</div>
                <div className="text-sm mt-1 text-slate-400">
                  Zero study. Recharge completely.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.blocks.map((block) => {
                  const sub = subjects.find((s) => s.key === block.subject)!;
                  const task = getTask(block.id, todayStr);
                  return (
                    <div
                      key={block.id}
                      className="card-extruded p-4 subject-card"
                      style={{
                        // @ts-ignore
                        "--subj-color": sub.color,
                        "--subj-glow": sub.glow
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{sub.icon}</span>
                            <span className="font-bold text-white">{block.label}</span>
                            {todaySchedule.isHybridDay && (
                              <span className="badge-3d text-[10px] border-amber-400 text-amber-400">
                                HYBRID
                              </span>
                            )}
                          </div>
                          <div className="text-xs mt-1 text-slate-400">
                            {block.timeSlot} · {block.lecturesPlanned} lecture{block.lecturesPlanned > 1 ? "s" : ""} planned
                          </div>
                        </div>
                        <div
                          className={`badge-3d text-xs ${
                            task.status === "done"
                              ? "text-emerald-400 border-emerald-400"
                              : task.status === "partial"
                              ? "text-amber-400 border-amber-400"
                              : task.status === "not-done"
                              ? "text-rose-400 border-rose-400"
                              : "text-slate-400 border-slate-600"
                          }`}
                        >
                          {task.status === "done"
                            ? "✓ Done"
                            : task.status === "partial"
                            ? "~ Partial"
                            : task.status === "not-done"
                            ? "✗ Missed"
                            : "⏳ Pending"}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {(["done", "partial", "not-done"] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() =>
                              updateTask(block.id, todayStr, {
                                status,
                                lecturesDone: status === "done" ? block.lecturesPlanned : task.lecturesDone
                              })
                            }
                            className="btn-3d btn-ghost text-xs px-3 py-1.5 flex-1"
                            style={
                              task.status === status
                                ? { background: sub.glow, borderColor: sub.color, color: sub.color }
                                : {}
                            }
                          >
                            {status === "done" ? "✅ Done" : status === "partial" ? "📊 Partial" : "❌ Missed"}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="text-center py-8 text-slate-400">No schedule found for today.</div>
          )}
        </div>

        {/* Monthly Pacing Guide Summary */}
        <div className="card-3d p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
            🗓️ Monthly Pacing Guide
          </h2>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 380 }}>
            {monthlyPacing.map((item, idx) => (
              <div key={idx} className="card-extruded p-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="font-bold text-white text-sm">{item.month}</div>
                  <span
                    className="badge-3d text-xs"
                    style={{
                      color: item.phase === "FINAL" ? "#ffb347" : item.phase === "1" ? "#00e5a0" : "#6c63ff",
                      borderColor: item.phase === "FINAL" ? "#ffb347" : item.phase === "1" ? "#00e5a0" : "#6c63ff"
                    }}
                  >
                    Phase {item.phase}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 mt-2">
                  {[
                    { label: "Physics", val: item.physicsChapters, color: "#00d4ff" },
                    { label: "Chem", val: item.chemistryChapters, color: "#00e5a0" },
                    { label: "Math", val: item.mathChapters, color: "#6c63ff" }
                  ].map((sub, sIdx) => (
                    <div key={sIdx} className="text-center rounded-lg p-1" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="text-sm font-black" style={{ color: sub.color }}>{sub.val}</div>
                      <div className="text-[10px] text-slate-400">{sub.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-2 text-slate-400">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
