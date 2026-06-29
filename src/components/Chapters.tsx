import React from "react";
import { PlannerState, Subject, Chapter, TestResult } from "../types";
import { subjects } from "../data";

interface ChaptersProps {
  state: PlannerState;
  updateLectures: (chapterId: string, watched: number) => void;
  updateTotalLectures: (chapterId: string, total: number) => void;
  toggleChapterComplete: (chapterId: string) => void;
  addTest: (chapterId: string, test: Omit<TestResult, "id">) => void;
  updateTest: (chapterId: string, testId: string, updates: Partial<TestResult>) => void;
  deleteTest: (chapterId: string, testId: string) => void;
  updateChapterNotes: (chapterId: string, notes: string) => void;
  getSubjectProgress: (subjectKey: string) => any;
}

export const Chapters: React.FC<ChaptersProps> = ({
  state,
  updateLectures,
  updateTotalLectures,
  toggleChapterComplete,
  addTest,
  updateTest,
  deleteTest,
  updateChapterNotes,
  getSubjectProgress
}) => {
  const [activeSubject, setActiveSubject] = React.useState<string>("physics");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "started" | "pending" | "completed">("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [testModalChapterId, setTestModalChapterId] = React.useState<string | null>(null);

  const selectedSub = React.useMemo(() => subjects.find((s) => s.key === activeSubject)!, [activeSubject]);
  const progress = React.useMemo(() => getSubjectProgress(selectedSub.key), [getSubjectProgress, selectedSub]);

  const filteredChapters = React.useMemo(() => {
    return selectedSub.chapters.filter((ch) => {
      const chState = state.chapters[ch.id];
      if (!chState) return false;

      // Filter by search query
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Filter by status
      if (statusFilter === "completed") return chState.completed;
      if (statusFilter === "started") return !chState.completed && chState.lecturesWatched > 0;
      if (statusFilter === "pending") return !chState.completed && chState.lecturesWatched === 0;
      return true;
    });
  }, [selectedSub, state.chapters, searchQuery, statusFilter]);

  const totalTestsCount = React.useMemo(() => {
    return selectedSub.chapters.reduce((sum, ch) => {
      const chState = state.chapters[ch.id];
      return sum + (chState?.testsDone?.length || 0);
    }, 0);
  }, [selectedSub, state.chapters]);

  return (
    <div className="space-y-5 p-4 md:p-6 anim-fade-scale">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">📚 Chapter Tracker</h1>
        <p className="text-sm mt-1 text-slate-400">
          Monitor your study progress, collapse custom notes, and record mock test results
        </p>
      </div>

      {/* Subject Tabs */}
      <div className="flex gap-2 flex-wrap">
        {subjects.map((sub) => {
          const subProgress = getSubjectProgress(sub.key);
          return (
            <button
              key={sub.key}
              onClick={() => setActiveSubject(sub.key)}
              className={`nav-tab ${activeSubject === sub.key ? "active" : ""}`}
              style={activeSubject === sub.key ? { borderColor: sub.color, color: sub.color } : {}}
            >
              {sub.icon} {sub.label}
              <span className="ml-1 text-xs opacity-60">
                ({subProgress.doneChapters}/{subProgress.totalChapters})
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Subject Progress Card */}
      <div className="card-3d p-5" style={{ borderTop: `2px solid ${selectedSub.color}` }}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{selectedSub.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-black text-white text-lg">{selectedSub.label}</h2>
                <span className="text-2xl font-black" style={{ color: selectedSub.color }}>
                  {progress.pct}%
                </span>
              </div>
              <div className="progress-3d">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress.pct}%`,
                    background: `linear-gradient(90deg, ${selectedSub.color}80, ${selectedSub.color})`,
                    boxShadow: `0 0 12px ${selectedSub.glow}`
                  }}
                />
              </div>
              <div className="flex gap-4 mt-2 text-xs text-slate-400">
                <span>📖 {progress.doneLectures} / {progress.totalLectures} lectures</span>
                <span>✅ {progress.doneChapters} / {progress.totalChapters} chapters</span>
                <span>🧪 {totalTestsCount} test{totalTestsCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-3d flex-1"
          placeholder="🔍 Search chapters..."
        />
        <div className="flex gap-2 flex-wrap">
          {(["all", "started", "pending", "completed"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setStatusFilter(mode)}
              className={`nav-tab text-sm ${statusFilter === mode ? "active" : ""}`}
            >
              {mode === "all"
                ? "📋 All"
                : mode === "started"
                ? "▶️ In Progress"
                : mode === "pending"
                ? "⏳ Pending"
                : "✅ Completed"}
            </button>
          ))}
        </div>
      </div>

      {/* Chapters Checklist */}
      <div className="space-y-3 stagger">
        {filteredChapters.length === 0 ? (
          <div className="card-3d p-10 text-center text-slate-400">
            No chapters match your filter requirements.
          </div>
        ) : (
          filteredChapters.map((ch, idx) => (
            <div
              key={ch.id}
              className="anim-fade-up"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <ChapterCard
                chapter={ch}
                subject={selectedSub}
                state={state}
                updateLectures={updateLectures}
                updateTotalLectures={updateTotalLectures}
                toggleChapterComplete={toggleChapterComplete}
                updateChapterNotes={updateChapterNotes}
                onOpenTests={() => setTestModalChapterId(ch.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Test Records Modal */}
      {testModalChapterId && (
        <TestModal
          chapterId={testModalChapterId}
          subject={selectedSub}
          state={state}
          onClose={() => setTestModalChapterId(null)}
          addTest={addTest}
          updateTest={updateTest}
          deleteTest={deleteTest}
        />
      )}
    </div>
  );
};

// Sub-component: ChapterCard
interface ChapterCardProps {
  chapter: Chapter;
  subject: Subject;
  state: PlannerState;
  updateLectures: (chapterId: string, watched: number) => void;
  updateTotalLectures: (chapterId: string, total: number) => void;
  toggleChapterComplete: (chapterId: string) => void;
  updateChapterNotes: (chapterId: string, notes: string) => void;
  onOpenTests: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  subject,
  state,
  updateLectures,
  updateTotalLectures,
  toggleChapterComplete,
  updateChapterNotes,
  onOpenTests
}) => {
  const chState = state.chapters[chapter.id];
  const [showNotes, setShowNotes] = React.useState(false);
  const [isEditingTotal, setIsEditingTotal] = React.useState(false);
  const [totalVal, setTotalVal] = React.useState(chState?.totalLectures.toString() || "0");

  if (!chState) return null;

  const pct = Math.min(100, Math.round((chState.lecturesWatched / chState.totalLectures) * 100));

  const averageScore = React.useMemo(() => {
    if (!chState.testsDone?.length) return null;
    const scores = chState.testsDone.map((t) => (t.score / t.maxScore) * 100);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [chState.testsDone]);

  const handleSaveTotal = () => {
    const val = parseInt(totalVal) || chState.totalLectures;
    updateTotalLectures(chapter.id, val);
    setIsEditingTotal(false);
  };

  return (
    <div
      className="card-extruded p-4 transition-all"
      style={{
        borderLeftColor: chState.completed ? "#00e5a0" : subject.color,
        borderLeftWidth: "3px",
        borderLeftStyle: "solid",
        boxShadow: chState.completed
          ? "var(--shadow-md), -2px 0 16px rgba(0,229,160,0.2)"
          : `var(--shadow-md), -2px 0 12px ${subject.glow}`,
        opacity: chState.completed ? 0.9 : 1
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={chState.completed}
            onChange={() => toggleChapterComplete(chapter.id)}
            className="checkbox-3d"
          />
        </div>
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <span className={`font-semibold text-sm ${chState.completed ? "line-through text-slate-400" : "text-white"}`}>
                {chapter.name}
              </span>
              {chapter.isBasics && (
                <span className="ml-2 badge-3d text-[10px] border-amber-400 text-amber-400">
                  BASICS
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              {chState.testsDone?.length > 0 && averageScore !== null && (
                <span
                  className="badge-3d text-[10px]"
                  style={{
                    color: averageScore >= 80 ? "#00e5a0" : averageScore >= 60 ? "#ffb347" : "#ff4d6d",
                    borderColor: averageScore >= 80 ? "#00e5a0" : averageScore >= 60 ? "#ffb347" : "#ff4d6d"
                  }}
                >
                  Avg: {averageScore}%
                </span>
              )}
              {chState.completed && (
                <span className="badge-3d text-[10px] border-emerald-400 text-emerald-400">
                  Done
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 progress-3d">
              <div
                className="progress-fill"
                style={{
                  width: `${pct}%`,
                  background: chState.completed
                    ? "linear-gradient(90deg, #00b87a, #00e5a0)"
                    : `linear-gradient(90deg, ${subject.color}80, ${subject.color})`,
                  boxShadow: chState.completed
                    ? "0 0 8px rgba(0, 229, 160, 0.4)"
                    : `0 0 8px ${subject.glow}`
                }}
              />
            </div>
            <span className="text-xs font-bold flex-shrink-0" style={{ color: chState.completed ? "#00e5a0" : subject.color }}>
              {pct}%
            </span>
          </div>

          {/* Counters & Actions */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Lectures:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateLectures(chapter.id, Math.max(0, chState.lecturesWatched - 1))}
                  className="btn-3d btn-ghost w-6 h-6 p-0 text-sm rounded-lg"
                >
                  −
                </button>
                <span className="text-sm font-bold text-white w-8 text-center">
                  {chState.lecturesWatched}
                </span>
                <button
                  onClick={() => updateLectures(chapter.id, chState.lecturesWatched + 1)}
                  className="btn-3d btn-ghost w-6 h-6 p-0 text-sm rounded-lg"
                >
                  +
                </button>
                <span className="text-xs text-slate-500">/</span>

                {isEditingTotal ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={totalVal}
                      onChange={(e) => setTotalVal(e.target.value)}
                      className="input-3d text-xs py-0.5 w-12"
                      style={{ padding: "2px 4px" }}
                    />
                    <button onClick={handleSaveTotal} className="btn-3d btn-success px-1.5 py-0.5 text-xs">
                      ✓
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTotalVal(chState.totalLectures.toString());
                      setIsEditingTotal(true);
                    }}
                    className="text-xs font-bold hover:underline cursor-pointer"
                    style={{ color: subject.color }}
                  >
                    {chState.totalLectures} ✏️
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={onOpenTests}
                className="btn-3d btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"
              >
                🧪 Tests {chState.testsDone?.length > 0 ? `(${chState.testsDone.length})` : ""}
              </button>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="btn-3d btn-ghost text-xs px-3 py-1.5"
              >
                📝 Notes
              </button>
            </div>
          </div>

          {/* Notes area */}
          {showNotes && (
            <div className="mt-3">
              <textarea
                value={chState.notes}
                onChange={(e) => updateChapterNotes(chapter.id, e.target.value)}
                className="input-3d text-sm w-full"
                rows={3}
                placeholder="Add custom notes, weak areas, revision targets..."
              />
            </div>
          )}

          {/* Time Dates */}
          {(chState.startedAt || chState.completedAt) && (
            <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
              {chState.startedAt && (
                <span>Started: {new Date(chState.startedAt).toLocaleDateString("en-IN")}</span>
              )}
              {chState.completedAt && (
                <span>Completed: {new Date(chState.completedAt).toLocaleDateString("en-IN")}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component: TestModal
interface TestModalProps {
  chapterId: string;
  subject: Subject;
  state: PlannerState;
  onClose: () => void;
  addTest: (chapterId: string, test: Omit<TestResult, "id">) => void;
  updateTest: (chapterId: string, testId: string, updates: Partial<TestResult>) => void;
  deleteTest: (chapterId: string, testId: string) => void;
}

const TestModal: React.FC<TestModalProps> = ({
  chapterId,
  subject,
  state,
  onClose,
  addTest,
  updateTest,
  deleteTest
}) => {
  const chState = state.chapters[chapterId];
  const [editingTestId, setEditingTestId] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    date: new Date().toISOString().split("T")[0],
    score: "",
    maxScore: "100",
    type: "chapter" as "chapter" | "unit" | "mock" | "practice",
    notes: ""
  });

  if (!chState) return null;

  const handleAddOrUpdate = () => {
    if (!form.score || !form.maxScore) return;
    const testData = {
      date: form.date,
      score: parseFloat(form.score),
      maxScore: parseFloat(form.maxScore),
      type: form.type,
      notes: form.notes
    };

    if (editingTestId) {
      updateTest(chapterId, editingTestId, testData);
      setEditingTestId(null);
    } else {
      addTest(chapterId, testData);
    }

    setForm({
      date: new Date().toISOString().split("T")[0],
      score: "",
      maxScore: "100",
      type: "chapter",
      notes: ""
    });
  };

  const handleEditClick = (t: TestResult) => {
    setEditingTestId(t.id);
    setForm({
      date: t.date,
      score: t.score.toString(),
      maxScore: t.maxScore.toString(),
      type: t.type,
      notes: t.notes || ""
    });
  };

  const pct = form.score && form.maxScore ? Math.round((parseFloat(form.score) / parseFloat(form.maxScore)) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card-3d p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto anim-fade-scale">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">🧪 Test Records</h3>
            <p className="text-xs mt-1" style={{ color: subject.color }}>
              {chState.chapterId}
            </p>
          </div>
          <button onClick={onClose} className="btn-3d btn-ghost w-9 h-9 rounded-full p-0 text-lg">
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <div className="card-extruded p-4 mb-4">
          <h4 className="text-sm font-bold text-white mb-3">
            {editingTestId ? "✏️ Edit Test Record" : "➕ Record New Test Score"}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block text-slate-400">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-3d text-sm py-2"
              />
            </div>
            <div>
              <label className="text-xs mb-1 block text-slate-400">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="input-3d text-sm py-2 bg-slate-950"
              >
                <option value="chapter">Chapter Test</option>
                <option value="unit">Unit Test</option>
                <option value="mock">Mock Exam</option>
                <option value="practice">Practice Set</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block text-slate-400">Score Obtained</label>
              <input
                type="number"
                min="0"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                className="input-3d text-sm py-2"
                placeholder="e.g. 85"
              />
            </div>
            <div>
              <label className="text-xs mb-1 block text-slate-400">Maximum Marks</label>
              <input
                type="number"
                min="1"
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                className="input-3d text-sm py-2"
                placeholder="e.g. 100"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs mb-1 block text-slate-400">Remarks / Mistakes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-3d text-sm py-2"
              placeholder="e.g. Calculation error in final step"
            />
          </div>

          {form.score && form.maxScore && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className="text-sm font-bold"
                style={{ color: pct >= 80 ? "#00e5a0" : pct >= 60 ? "#ffb347" : "#ff4d6d" }}
              >
                {pct}%
              </div>
              <div className="flex-1 progress-3d" style={{ height: 6 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${pct}%`,
                    background: pct >= 80 ? "#00e5a0" : pct >= 60 ? "#ffb347" : "#ff4d6d"
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {editingTestId ? (
              <>
                <button onClick={handleAddOrUpdate} className="btn-3d btn-primary flex-1 text-sm py-2">
                  💾 Update Record
                </button>
                <button
                  onClick={() => {
                    setEditingTestId(null);
                    setForm({
                      date: new Date().toISOString().split("T")[0],
                      score: "",
                      maxScore: "100",
                      type: "chapter",
                      notes: ""
                    });
                  }}
                  className="btn-3d btn-ghost text-sm py-2 px-4"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={handleAddOrUpdate} className="btn-3d btn-success flex-1 text-sm py-2">
                ➕ Add Test Entry
              </button>
            )}
          </div>
        </div>

        {/* Modal List */}
        <div className="space-y-2 max-y-64 overflow-y-auto">
          {chState.testsDone?.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No recorded tests yet. Fill details above to add.
            </div>
          ) : (
            chState.testsDone?.map((t) => {
              const testPct = Math.round((t.score / t.maxScore) * 100);
              return (
                <div key={t.id} className="card-extruded p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge-3d text-xs" style={{ color: subject.color, borderColor: subject.color }}>
                        {t.type}
                      </span>
                      <span className="text-xs text-slate-300">
                        {new Date(t.date + "T00:00:00").toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-black text-lg"
                        style={{ color: testPct >= 80 ? "#00e5a0" : testPct >= 60 ? "#ffb347" : "#ff4d6d" }}
                      >
                        {testPct}%
                      </span>
                      <span className="text-xs text-slate-400">
                        ({t.score}/{t.maxScore})
                      </span>
                      <button
                        onClick={() => handleEditClick(t)}
                        className="btn-3d btn-ghost w-7 h-7 p-0 text-sm rounded-lg"
                        title="Edit Record"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTest(chapterId, t.id)}
                        className="btn-3d btn-danger w-7 h-7 p-0 text-sm rounded-lg"
                        title="Delete Record"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  {t.notes && <p className="text-xs mt-1.5 italic text-slate-400">💬 {t.notes}</p>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
