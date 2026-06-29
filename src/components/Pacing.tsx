import React from "react";
import { PlannerState } from "../types";
import { subjects, monthlyPacing } from "../data";

interface PacingProps {
  state: PlannerState;
  getSubjectProgress: (subjectKey: string) => any;
  getOverallProgress: () => any;
}

export const Pacing: React.FC<PacingProps> = ({
  state,
  getSubjectProgress,
  getOverallProgress
}) => {
  const targetDate = new Date("2026-12-06");
  const today = new Date();
  
  // Calculate days/weeks left to Dec 6, 2026
  const daysLeft = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const weeksLeft = Math.max(0, Math.ceil(daysLeft / 7));

  const overall = getOverallProgress();
  const lecturesLeft = Math.max(0, overall.total - overall.done);
  
  // Calculate average lectures required per study day (assuming 6 study days per week)
  const studyDaysLeft = Math.max(1, Math.round(daysLeft * (6 / 7)));
  const lecPerStudyDay = studyDaysLeft > 0 ? (lecturesLeft / studyDaysLeft).toFixed(1) : "0";

  // Check if student is ahead of or behind schedule
  const startDate = new Date("2026-06-21"); // Start anchor
  const totalDays = Math.max(1, Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const timeElapsedPct = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
  
  const isOnTrack = overall.pct >= timeElapsedPct;

  const subjectPacing = React.useMemo(() => {
    return subjects.map((sub) => {
      const prog = getSubjectProgress(sub.key);
      const remLec = Math.max(0, prog.totalLectures - prog.doneLectures);
      const remCh = Math.max(0, prog.totalChapters - prog.doneChapters);
      const chPerWeek = weeksLeft > 0 ? (remCh / weeksLeft).toFixed(1) : "0";
      const lecPerWeek = weeksLeft > 0 ? (remLec / weeksLeft).toFixed(1) : "0";

      return {
        ...sub,
        prog,
        remLec,
        remCh,
        chPerWeek,
        lecPerWeek
      };
    });
  }, [getSubjectProgress, weeksLeft]);

  return (
    <div className="space-y-6 p-4 md:p-6 anim-fade-scale">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">🗓️ Pacing & Deadline Guide</h1>
        <p className="text-sm mt-1 text-slate-400">
          Real-time countdown and chapter-by-chapter pacing targets to finish by Dec 6, 2026
        </p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        {[
          { icon: "⏰", label: "Days Left", value: daysLeft, color: daysLeft < 30 ? "#ff4d6d" : daysLeft < 60 ? "#ffb347" : "#00e5a0" },
          { icon: "📅", label: "Weeks Left", value: weeksLeft, color: "#6c63ff" },
          { icon: "📚", label: "Lectures Left", value: lecturesLeft, color: "#00d4ff" },
          { icon: "📊", label: "Lec/Study Day", value: lecPerStudyDay, color: "#ffb347" }
        ].map((item, idx) => (
          <div key={idx} className="metric-widget text-center anim-fade-up">
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-3xl font-black" style={{ color: item.color }}>
              {item.value}
            </div>
            <div className="text-xs font-semibold text-white mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* On Track Indicator */}
      <div
        className="card-3d p-5"
        style={{
          borderTop: `2px solid ${isOnTrack ? "#00e5a0" : "#ff4d6d"}`,
          boxShadow: `var(--shadow-lg), 0 -2px 20px ${isOnTrack ? "rgba(0,229,160,0.15)" : "rgba(255,77,109,0.15)"}`
        }}
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">{isOnTrack ? "✅" : "⚠️"}</span>
          <div className="flex-1">
            <h3 className="font-black text-white text-base">
              {isOnTrack ? "You are on track! 🎯" : "Behind schedule — accelerate! 🚀"}
            </h3>
            <p className="text-sm mt-1 text-slate-400">
              {isOnTrack
                ? `You have completed ${overall.pct}% of the syllabus, which is ahead of the time-elapsed estimate (${timeElapsedPct}%). Keep up the great pace!`
                : `You need to accelerate. Target completing ${lecPerStudyDay} lectures per study day to finish the remainder by December 6, 2026.`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black" style={{ color: isOnTrack ? "#00e5a0" : "#ff4d6d" }}>
              {overall.pct}%
            </div>
            <div className="text-xs text-slate-400">Syllabus Done</div>
          </div>
        </div>
      </div>

      {/* Subject Pacing Table */}
      <div className="card-3d p-5">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
          📊 Per-Subject Pacing Required
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/5">
                {["Subject", "Progress", "Done", "Remaining", "Ch Left", "Ch / Week", "Lec / Week"].map((header) => (
                  <th key={header} className="pb-3 pr-4 font-bold text-xs uppercase tracking-wider text-slate-400">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subjectPacing.map((sub) => (
                <tr key={sub.key}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sub.icon}</span>
                      <span className="font-semibold text-white">{sub.label}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="w-24">
                      <div className="progress-3d" style={{ height: 6 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${sub.prog.pct}%`,
                            background: `linear-gradient(90deg, ${sub.color}80, ${sub.color})`
                          }}
                        />
                      </div>
                      <div className="text-[10px] mt-0.5 font-bold" style={{ color: sub.color }}>
                        {sub.prog.pct}%
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-emerald-400">
                    {sub.prog.doneLectures} / {sub.prog.totalLectures}
                  </td>
                  <td className="py-3 pr-4 font-bold" style={{ color: sub.remLec > 0 ? sub.color : "#00e5a0" }}>
                    {sub.remLec} lec
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{sub.remCh} ch</td>
                  <td className="py-3 pr-4">
                    <span
                      className="badge-3d text-[10px]"
                      style={{
                        color: parseFloat(sub.chPerWeek) > 1.5 ? "#ff4d6d" : parseFloat(sub.chPerWeek) > 0.8 ? "#ffb347" : "#00e5a0",
                        borderColor: parseFloat(sub.chPerWeek) > 1.5 ? "#ff4d6d" : parseFloat(sub.chPerWeek) > 0.8 ? "#ffb347" : "#00e5a0"
                      }}
                    >
                      {sub.chPerWeek}/wk
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="badge-3d text-[10px]" style={{ color: sub.color, borderColor: sub.color }}>
                      {sub.lecPerWeek}/wk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Checklist */}
      <div className="card-3d p-5">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
          📅 Monthly Pacing Target Checklist
        </h3>
        <div className="space-y-4">
          {monthlyPacing.map((item, idx) => {
            const isCurrentMonth = idx === 1; // August is the current month in our mock timing
            return (
              <div
                key={idx}
                className="card-extruded p-4"
                style={isCurrentMonth ? { borderColor: "rgba(108,99,255,0.4)", boxShadow: "var(--shadow-md), 0 0 20px rgba(108,99,255,0.15)" } : {}}
              >
                <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {isCurrentMonth && <span className="text-amber-400">▶</span>}
                    <h4 className="font-black text-white">{item.month}</h4>
                    {isCurrentMonth && (
                      <span className="badge-3d text-[10px] border-indigo-400 text-indigo-400">
                        CURRENT
                      </span>
                    )}
                  </div>
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
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { label: "⚡ Physics", val: item.physicsChapters, color: "#00d4ff" },
                    { label: "🧪 Chemistry", val: item.chemistryChapters, color: "#00e5a0" },
                    { label: "∑ Math", val: item.mathChapters, color: "#6c63ff" }
                  ].map((sub, sIdx) => (
                    <div key={sIdx} className="text-center rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="text-2xl font-black" style={{ color: sub.color }}>{sub.val}</div>
                      <div className="text-xs text-slate-400 mt-1">{sub.label}</div>
                      <div className="text-[10px] text-slate-500">Chapters</div>
                    </div>
                  ))}
                </div>
                <div className="text-sm p-3 rounded-xl bg-white/2 border border-white/5 text-slate-400">
                  {item.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
