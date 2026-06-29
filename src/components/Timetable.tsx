import React from "react";
import { PlannerState, DaySchedule, Block } from "../types";
import { subjects } from "../data";

interface TimetableProps {
  state: PlannerState;
  schedule: DaySchedule[];
  getTask: (blockId: string, date: string) => any;
  updateTask: (blockId: string, date: string, updates: any) => void;
  getWeekSchedule: (week: number) => DaySchedule[];
}

export const Timetable: React.FC<TimetableProps> = ({
  state,
  schedule,
  getTask,
  updateTask,
  getWeekSchedule
}) => {
  const [viewMode, setViewMode] = React.useState<"week" | "phase1" | "phase2">("week");
  const [selectedWeek, setSelectedWeek] = React.useState<number>(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayDay = schedule.find((d) => d.date === todayStr);
    return todayDay?.week || 1;
  });

  const weekSchedule = React.useMemo(() => getWeekSchedule(selectedWeek), [getWeekSchedule, selectedWeek]);
  const phase1Sample = React.useMemo(() => getWeekSchedule(1), [getWeekSchedule]);
  const phase2Sample = React.useMemo(() => getWeekSchedule(4), [getWeekSchedule]);

  const activeSchedule = React.useMemo(() => {
    if (viewMode === "week") return weekSchedule;
    if (viewMode === "phase1") return phase1Sample;
    return phase2Sample;
  }, [viewMode, weekSchedule, phase1Sample, phase2Sample]);

  const handleJumpToToday = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayDay = schedule.find((d) => d.date === todayStr);
    if (todayDay) {
      setSelectedWeek(todayDay.week);
      setViewMode("week");
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6 anim-fade-scale">
      {/* View Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            📅 Weekly Timetable
          </h1>
          <p className="text-sm mt-1 text-slate-400">
            Study schedule with planned lecture blocks
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["week", "phase1", "phase2"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`nav-tab text-xs md:text-sm ${viewMode === mode ? "active" : ""}`}
            >
              {mode === "week"
                ? "📆 This Week"
                : mode === "phase1"
                ? "🌱 Phase 1 Template"
                : "🚀 Phase 2 Template"}
            </button>
          ))}
        </div>
      </div>

      {/* Week Selector Bar */}
      {viewMode === "week" && (
        <div className="card-3d p-4 flex items-center justify-between">
          <button
            onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
            disabled={selectedWeek <= 1}
            className="btn-3d btn-ghost px-4 py-2 disabled:opacity-30"
          >
            ← Prev
          </button>
          <div className="text-center">
            <div className="font-black text-white text-lg">Week {selectedWeek}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {selectedWeek <= 3 ? "Phase 1 — Rhythm Builder" : "Phase 2 — Final Execution"}
            </div>
            {activeSchedule[0] && (
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                {new Date(activeSchedule[0].date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short"
                })}{" "}
                –{" "}
                {new Date(activeSchedule[activeSchedule.length - 1].date).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short" }
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setSelectedWeek((w) => Math.min(24, w + 1))}
            disabled={selectedWeek >= 24}
            className="btn-3d btn-ghost px-4 py-2 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}

      {/* Info Cards */}
      {viewMode !== "week" && (
        <div className="card-extruded px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">{viewMode === "phase1" ? "🌱" : "🚀"}</span>
          <div>
            <div className="font-bold text-white text-sm">
              {viewMode === "phase1"
                ? "Phase 1: Rhythm Builder (Weeks 1–3)"
                : "Phase 2: Final Execution (Weeks 4–24)"}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {viewMode === "phase1"
                ? "1 lecture/session · Alternate Day A & B study blocks."
                : "2 lectures/session (Phy & Math) · 1 for Chem · Language blocks active."}
            </div>
          </div>
        </div>
      )}

      {/* Timetable Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger">
        {activeSchedule.map((day) => (
          <DayCard
            key={day.date}
            day={day}
            state={state}
            getTask={getTask}
            updateTask={updateTask}
          />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button onClick={handleJumpToToday} className="btn-3d btn-primary px-6 py-2.5">
          📍 Jump to Today
        </button>
      </div>
    </div>
  );
};

// Sub-component: DayCard
const DayCard: React.FC<{
  day: DaySchedule;
  state: PlannerState;
  getTask: (blockId: string, date: string) => any;
  updateTask: (blockId: string, date: string, updates: any) => void;
}> = ({ day, state, getTask, updateTask }) => {
  const isSunday = day.dayType === "SUNDAY";
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = day.date === todayStr;

  const isDayDone = React.useMemo(() => {
    if (isSunday) return true;
    return day.blocks.every((b) => getTask(b.id, day.date).status === "done");
  }, [day, getTask, isSunday]);

  const isDayMissed = React.useMemo(() => {
    if (isSunday) return false;
    return day.blocks.some((b) => getTask(b.id, day.date).status === "not-done");
  }, [day, getTask, isSunday]);

  return (
    <div
      className="card-3d overflow-hidden anim-fade-up"
      style={
        isToday
          ? {
              borderColor: "rgba(108, 99, 255, 0.4)",
              boxShadow: "var(--shadow-xl), 0 0 30px rgba(108, 99, 255, 0.15)"
            }
          : {}
      }
    >
      {/* Day Card Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: isToday
            ? "linear-gradient(135deg, rgba(108, 99, 255, 0.15), rgba(0, 212, 255, 0.08))"
            : isSunday
            ? "linear-gradient(135deg, rgba(255, 107, 157, 0.08), rgba(255, 179, 71, 0.04))"
            : "rgba(255, 255, 255, 0.02)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-black text-white text-base">
            {day.dayOfWeek === "Sunday" ? "Sunday" : day.dayOfWeek}
          </span>
          {isToday && (
            <span className="badge-3d text-[10px] border-violet-400 text-violet-400">
              TODAY
            </span>
          )}
          {day.isHybridDay && (
            <span className="badge-3d text-[10px] border-amber-400 text-amber-400">
              HYBRID
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {new Date(day.date + "T00:00:00").toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short"
            })}
          </span>
          {!isSunday && (
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isDayDone ? "bg-emerald-400" : isDayMissed ? "bg-rose-400" : "bg-slate-600"
              }`}
              style={isDayDone ? { boxShadow: "0 0 8px #00e5a0" } : {}}
            />
          )}
        </div>
      </div>

      {/* Day Card Body */}
      <div className="p-4">
        {isSunday ? (
          <div className="flex items-center justify-center py-6 gap-3">
            <span className="text-3xl">🌟</span>
            <div>
              <div className="font-bold text-white text-sm">Rest & Recharge</div>
              <div className="text-xs text-slate-400">
                Zero study day — personal offline downtime
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: day.dayType === "A" ? "#00d4ff" : "#6c63ff" }}
              >
                Day Type {day.dayType} · Phase {day.phase}
              </span>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>

            {day.blocks.map(block => (
              <BlockRow
                key={block.id}
                block={block}
                date={day.date}
                store={{ getTask, updateTask }}
                isHybrid={day.isHybridDay}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper block item
interface BlockRowProps {
  block: Block;
  date: string;
  store: {
    getTask: (blockId: string, date: string) => any;
    updateTask: (blockId: string, date: string, updates: any) => void;
  };
  isHybrid: boolean;
}

const BlockRow: React.FC<BlockRowProps> = ({ block, date, store, isHybrid }) => {
  const task = store.getTask(block.id, date);
  const subjectKey = task.subjectOverride || block.subject;
  const sub = subjects.find((s) => s.key === subjectKey)!;
  const originalSub = subjects.find((s) => s.key === block.subject)!;
  const isSwapped = !!task.subjectOverride && task.subjectOverride !== block.subject;

  const [showExtraInput, setShowExtraInput] = React.useState(false);
  const [extraInputVal, setExtraInputVal] = React.useState(task.extraLectures.toString());
  const [showSwapDropdown, setShowSwapDropdown] = React.useState(false);

  const statusColors = {
    pending: "rgba(255, 255, 255, 0.04)",
    done: "rgba(0, 229, 160, 0.08)",
    "not-done": "rgba(255, 77, 109, 0.08)",
    partial: "rgba(255, 179, 71, 0.08)"
  };

  const statusBorderColors = {
    pending: "rgba(255, 255, 255, 0.08)",
    done: "rgba(0, 229, 160, 0.3)",
    "not-done": "rgba(255, 77, 109, 0.3)",
    partial: "rgba(255, 179, 71, 0.3)"
  };

  const statusTexts = {
    pending: "⏳ Pending",
    done: "✓ Done",
    "not-done": "✗ Missed",
    partial: "~ Partial"
  };

  const handleStatusChange = (status: "done" | "partial" | "not-done") => {
    store.updateTask(block.id, date, {
      status,
      lecturesDone: status === "done" ? block.lecturesPlanned + task.extraLectures : task.lecturesDone
    });
  };

  const handleSaveExtraLectures = () => {
    const amt = Math.max(0, parseInt(extraInputVal) || 0);
    store.updateTask(block.id, date, { extraLectures: amt });
    setShowExtraInput(false);
  };

  const handleSwapSubject = (newSubject: string) => {
    const override = newSubject === block.subject ? null : newSubject;
    store.updateTask(block.id, date, { subjectOverride: override });
    setShowSwapDropdown(false);
  };

  return (
    <div
      className="card-extruded p-4 transition-all"
      style={{
        borderLeftColor: task.status === "done" ? "#00e5a0" : sub.color,
        borderLeftWidth: "3px",
        borderLeftStyle: "solid",
        borderTopColor: statusBorderColors[task.status],
        borderRightColor: statusBorderColors[task.status],
        borderBottomColor: statusBorderColors[task.status],
        boxShadow: `var(--shadow-md), -2px 0 16px ${sub.glow}`,
        background: statusColors[task.status]
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl">{sub.icon}</span>
          <span className="font-bold text-white text-sm">
            {isSwapped ? sub.label : block.label}
          </span>
          {isSwapped && (
            <span className="badge-3d text-[9px] text-sky-400 border-sky-400" title={`Scheduled: ${originalSub.label}`}>
              SWAPPED
            </span>
          )}
          {isHybrid && (
            <span className="badge-3d text-[9px] text-amber-400 border-amber-400">
              HYBRID
            </span>
          )}
          {block.blockType === "revision" && (
            <span className="badge-3d text-[9px] text-cyan-400 border-cyan-400">
              RECALL
            </span>
          )}
        </div>
        <span
          className="badge-3d text-xs flex-shrink-0"
          style={{
            color: task.status === "done" ? "#00e5a0" : task.status === "not-done" ? "#ff4d6d" : task.status === "partial" ? "#ffb347" : "rgba(255, 255, 255, 0.4)",
            borderColor: task.status === "done" ? "#00e5a0" : task.status === "not-done" ? "#ff4d6d" : task.status === "partial" ? "#ffb347" : "rgba(255, 255, 255, 0.15)"
          }}
        >
          {statusTexts[task.status]}
        </span>
      </div>

      <div className="text-xs mb-3 space-y-1 text-slate-400">
        <div>🕐 {block.timeSlot}</div>
        <div>
          📚 {block.lecturesPlanned} lecture{block.lecturesPlanned > 1 ? "s" : ""} planned
        </div>
        {task.extraLectures > 0 && (
          <div className="font-semibold text-emerald-400">
            ➕ {task.extraLectures} extra lecture{task.extraLectures > 1 ? "s" : ""} added!
          </div>
        )}
        {task.notes && <div className="italic text-slate-300">💬 {task.notes}</div>}
      </div>

      {/* Button Controls */}
      <div className="flex gap-1.5 mb-2">
        {(["done", "partial", "not-done"] as const).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className="btn-3d btn-ghost flex-1 text-xs py-1.5"
            style={
              task.status === status
                ? {
                    background:
                      status === "done"
                        ? "rgba(0, 229, 160, 0.15)"
                        : status === "not-done"
                        ? "rgba(255, 77, 109, 0.15)"
                        : "rgba(255, 179, 71, 0.15)",
                    borderColor:
                      status === "done" ? "#00e5a0" : status === "not-done" ? "#ff4d6d" : "#ffb347",
                    color: status === "done" ? "#00e5a0" : status === "not-done" ? "#ff4d6d" : "#ffb347"
                  }
                : {}
            }
          >
            {status === "done" ? "✅" : status === "partial" ? "📊" : "❌"}
          </button>
        ))}
        <button
          onClick={() => setShowExtraInput(!showExtraInput)}
          className="btn-3d btn-ghost text-xs px-2.5 py-1.5 text-violet-400 border-violet-400/40"
          title="Add extra lectures"
        >
          ➕
        </button>
        {["physics", "chemistry", "math"].includes(block.subject) && (
          <button
            onClick={() => setShowSwapDropdown(!showSwapDropdown)}
            className="btn-3d btn-ghost text-xs px-2.5 py-1.5"
            style={{ color: sub.color, borderColor: `${sub.color}55` }}
            title="Swap Subject"
          >
            🔀
          </button>
        )}
      </div>

      {/* Swap Subject Dropdown Panel */}
      {showSwapDropdown && (
        <div className="mt-2 p-2 rounded-lg space-y-2 bg-slate-900/50 border border-white/5">
          <div className="text-[10px] text-slate-400">Swap block to another subject:</div>
          <div className="flex gap-1.5 flex-wrap">
            {["physics", "chemistry", "math"].map((k) => {
              const d = subjects.find((s) => s.key === k)!;
              const isSelected = subjectKey === k;
              return (
                <button
                  key={k}
                  onClick={() => handleSwapSubject(k)}
                  className="btn-3d btn-ghost flex-1 text-xs py-1"
                  style={
                    isSelected
                      ? { background: d.glow, borderColor: d.color, color: d.color }
                      : { color: d.color, borderColor: `${d.color}44` }
                  }
                >
                  {d.icon} {d.label}
                </button>
              );
            })}
          </div>
          {isSwapped && (
            <button
              onClick={() => handleSwapSubject(block.subject)}
              className="btn-3d btn-ghost text-[10px] w-full py-1 text-slate-400"
            >
              ↺ Reset to Scheduled ({originalSub.label})
            </button>
          )}
        </div>
      )}

      {/* Extra Lectures Input Panel */}
      {showExtraInput && (
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            min="0"
            max="10"
            value={extraInputVal}
            onChange={(e) => setExtraInputVal(e.target.value)}
            className="input-3d text-sm py-1.5 flex-1"
            placeholder="Extra lectures done"
          />
          <button onClick={handleSaveExtraLectures} className="btn-3d btn-success text-xs px-3">
            Save
          </button>
          <button onClick={() => setShowExtraInput(false)} className="btn-3d btn-ghost text-xs px-3">
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
