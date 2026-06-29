import React from "react";
import { PlannerState, Subject, Chapter } from "../types";
import { subjects } from "../data";

interface SettingsProps {
  state: PlannerState;
  updateTotalLectures: (chapterId: string, total: number) => void;
  resetAll: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  state,
  updateTotalLectures,
  resetAll
}) => {
  const [showConfirmReset, setShowConfirmReset] = React.useState(false);

  const handleExportBackup = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anurag-planner-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data && typeof data === "object" && data.chapters) {
          localStorage.setItem("anurag_planner_v2", JSON.stringify(data));
          window.location.reload();
        } else {
          alert("Invalid backup file structure!");
        }
      } catch (err) {
        alert("Failed to parse JSON backup file!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 anim-fade-scale">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">⚙️ Settings & Profile</h1>
        <p className="text-sm mt-1 text-slate-400">
          Manage your planner data, backup files, and academic properties
        </p>
      </div>

      {/* Profile Header */}
      <div className="card-3d p-6 relative overflow-hidden shimmer">
        <div className="absolute inset-0 star-grid opacity-20 pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <img
            src="/src/assets/images/command_center_logo_1782709278192.jpg"
            alt="Anurag's PCM Command Logo"
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50 animate-pulse"
            style={{
              boxShadow: "0 0 20px rgba(108, 99, 255, 0.5)"
            }}
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="text-xl font-black text-white">Anurag Singh Indoliya</h2>
            <div className="text-sm mt-0.5 text-slate-400">Class 12 PCM Student</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {subjects.map((s) => (
                <span key={s.key} className="badge-3d text-[10px]" style={{ color: s.color, borderColor: s.color }}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Plan Start", value: "21 Jun 2026" },
            { label: "Target Date", value: "07 Dec 2025" },
            { label: "Total Weeks", value: "24 Weeks" },
            { label: "Study Streak", value: `${state.streak} Days 🔥` }
          ].map((item, idx) => (
            <div key={idx} className="card-extruded px-3 py-2 text-center">
              <div className="text-sm font-bold text-white">{item.value}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Lecture Counts per chapter */}
      <div className="card-3d p-5">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
          🎛️ Adjust Chapter Total Lectures
        </h3>
        <p className="text-sm mb-4 text-slate-400">
          Modify total planned lectures per chapter easily below to customize your schedule targets.
        </p>

        <div className="space-y-4">
          {subjects.map((sub) => (
            <div key={sub.key} className="card-extruded p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{sub.icon}</span>
                <span className="font-bold text-white">{sub.label}</span>
                <span className="ml-auto text-xs text-slate-500">
                  Total Chapters: {sub.chapters.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sub.chapters.map((ch) => {
                  const chState = state.chapters[ch.id];
                  const currentTotal = chState?.totalLectures || ch.lectures;
                  return (
                    <div
                      key={ch.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/2 hover:bg-white/5 transition-all"
                    >
                      <span className="text-xs text-slate-300 truncate pr-4">{ch.name}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => updateTotalLectures(ch.id, Math.max(1, currentTotal - 1))}
                          className="btn-3d btn-ghost w-6 h-6 p-0 text-xs rounded-lg"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-black text-white">
                          {currentTotal}
                        </span>
                        <button
                          onClick={() => updateTotalLectures(ch.id, currentTotal + 1)}
                          className="btn-3d btn-ghost w-6 h-6 p-0 text-xs rounded-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Backups */}
      <div className="card-3d p-5">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
          💾 Data Management
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={handleExportBackup} className="btn-3d btn-primary py-3 flex-col gap-1 h-auto">
            <span className="text-2xl">📤</span>
            <span className="text-sm font-bold">Export Backup</span>
            <span className="text-[10px] opacity-60">Download JSON File</span>
          </button>

          <label className="btn-3d btn-ghost py-3 flex flex-col items-center gap-1 h-auto cursor-pointer">
            <span className="text-2xl">📥</span>
            <span className="text-sm font-bold">Import Backup</span>
            <span className="text-[10px] opacity-60">Restore JSON File</span>
            <input type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
          </label>

          <button onClick={() => setShowConfirmReset(true)} className="btn-3d btn-danger py-3 flex-col gap-1 h-auto">
            <span className="text-2xl">🗑️</span>
            <span className="text-sm font-bold">Reset All Data</span>
            <span className="text-[10px] opacity-60">Reset all progress</span>
          </button>
        </div>

        {showConfirmReset && (
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <p className="text-sm text-white font-semibold mb-3">
              ⚠️ Are you absolutely sure? This will delete all your study progress, recorded test scores, and task completion logs.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  resetAll();
                  setShowConfirmReset(false);
                }}
                className="btn-3d btn-danger px-5 py-2 text-sm"
              >
                Yes, Reset Everything
              </button>
              <button onClick={() => setShowConfirmReset(false)} className="btn-3d btn-ghost px-5 py-2 text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reference Study Guidelines */}
      <div className="card-3d p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <span>📋</span> Quick Reference — Study Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            {
              title: "🌅 Block 1: Morning Block",
              color: "#00d4ff",
              rules: [
                "Time: 6:00 AM – 8:00 AM",
                "Day A: Physics | Day B: Math",
                "Phase 1: 1 lecture per block",
                "Phase 2: 2 lectures per block (Phy & Math)"
              ]
            },
            {
              title: "☀️ Block 2: Midday Block",
              color: "#00e5a0",
              rules: [
                "Time: 12:00 PM onwards",
                "Day A: Chemistry | Day B: English/Hindi",
                "Chemistry is always 1 lecture per session",
                "Language is 45 mins max (Phase 2 onwards)"
              ]
            },
            {
              title: "📅 Weekly Structure",
              color: "#ff6b9d",
              rules: [
                "Monday–Thursday: Focused Core study lectures",
                "Friday: 1 new lecture + Spaced Recall (Phy/Chem)",
                "Saturday: 1 new lecture + Spaced Recall (Math/Lang)",
                "Sunday: Complete rest day. Zero study."
              ]
            },
            {
              title: "🧠 Revision & Spaced Recall",
              color: "#ffb347",
              rules: [
                "First 15-20 min of every block: Review previous notes",
                "Active Recall: Active formulas write-up from memory",
                "Spaced Recall: Weekly cumulative reviews",
                "Blank-Sheet Method: Summarize chapter on a blank sheet"
              ]
            }
          ].map((item, idx) => (
            <div key={idx} className="card-extruded p-4" style={{ borderLeftColor: item.color, borderLeftWidth: "3px", borderLeftStyle: "solid" }}>
              <h4 className="font-bold mb-2" style={{ color: item.color }}>{item.title}</h4>
              <ul className="space-y-1">
                {item.rules.map((rule, rIdx) => (
                  <li key={rIdx} className="flex gap-2 text-slate-400 text-xs">
                    <span style={{ color: item.color }}>›</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
