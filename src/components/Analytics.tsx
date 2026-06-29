import React from "react";
import { PlannerState, DaySchedule, TaskState, ChapterState } from "../types";
import { subjects, monthlyPacing } from "../data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";

interface AnalyticsProps {
  state: PlannerState;
  schedule: DaySchedule[];
  getSubjectProgress: (subjectKey: string) => any;
  getOverallProgress: () => any;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  state,
  schedule,
  getSubjectProgress,
  getOverallProgress
}) => {
  const overall = getOverallProgress();

  // 1. Data for Subject Bar Chart (Done vs Remaining)
  const subjectBarData = React.useMemo(() => {
    return subjects.map((sub) => {
      const prog = getSubjectProgress(sub.key);
      const remaining = Math.max(0, prog.totalLectures - prog.doneLectures);
      return {
        name: sub.label,
        Done: prog.doneLectures,
        Remaining: remaining,
        color: sub.color
      };
    });
  }, [getSubjectProgress]);

  // 2. Data for Lecture Distribution Pie Chart
  const pieData = React.useMemo(() => {
    return subjects
      .map((sub) => {
        const prog = getSubjectProgress(sub.key);
        return {
          name: sub.label,
          value: prog.doneLectures || 0,
          color: sub.color
        };
      })
      .filter((item) => item.value > 0);
  }, [getSubjectProgress]);

  const totalDoneLectures = React.useMemo(() => {
    return pieData.reduce((sum, item) => sum + item.value, 0);
  }, [pieData]);

  // 3. Data for Weekly Progress Area Chart
  const weeklyTrendData = React.useMemo(() => {
    const weeklySums: Record<number, number> = {};
    (Object.values(state.tasks) as TaskState[]).forEach((task) => {
      const matchedDay = schedule.find((d) => d.date === task.date);
      if (matchedDay && (task.status === "done" || task.status === "partial")) {
        const wk = matchedDay.week;
        weeklySums[wk] = (weeklySums[wk] || 0) + (task.lecturesDone + task.extraLectures);
      }
    });

    return Array.from({ length: 24 }, (_, idx) => {
      const wk = idx + 1;
      return {
        week: `Wk ${wk}`,
        Lectures: weeklySums[wk] || 0
      };
    });
  }, [state.tasks, schedule]);

  // 4. Data for Task Status
  const taskSummary = React.useMemo(() => {
    const tasks = Object.values(state.tasks) as TaskState[];
    const total = tasks.length;
    if (!total) {
      return { done: 0, partial: 0, missed: 0, pending: 0, rate: 0 };
    }
    const done = tasks.filter((t) => t.status === "done").length;
    const partial = tasks.filter((t) => t.status === "partial").length;
    const missed = tasks.filter((t) => t.status === "not-done").length;
    const pending = Math.max(0, total - done - partial - missed);
    const rate = Math.round(((done + partial * 0.5) / total) * 100);

    return { done, partial, missed, pending, rate };
  }, [state.tasks]);

  // 5. Average Test Scores by Subject
  const subjectTestScores = React.useMemo(() => {
    return subjects.map((sub) => {
      const testList = sub.chapters.flatMap(
        (ch) => state.chapters[ch.id]?.testsDone || []
      );
      const scores = testList.map((t) => (t.score / t.maxScore) * 100);
      const avg = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      return {
        name: sub.label,
        color: sub.color,
        avg,
        count: scores.length
      };
    });
  }, [state.chapters]);

  // 6. Test Score History
  const testHistoryData = React.useMemo(() => {
    const allTests: any[] = [];
    subjects.forEach((sub) => {
      sub.chapters.forEach((ch) => {
        const chState = state.chapters[ch.id];
        if (chState && chState.testsDone) {
          chState.testsDone.forEach((t) => {
            allTests.push({
              date: t.date,
              subject: sub.label,
              Score: Math.round((t.score / t.maxScore) * 100),
              type: t.type,
              color: sub.color
            });
          });
        }
      });
    });
    return allTests.sort((a, b) => a.date.localeCompare(b.date));
  }, [state.chapters]);

  const tooltipStyles = {
    background: "#141829",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "12px"
  };

  return (
    <div className="space-y-6 p-4 md:p-6 anim-fade-scale">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">📊 Analytics Dashboard</h1>
        <p className="text-sm mt-1 text-slate-400">
          Visualized insights of your overall consistency, lecture metrics, and mock test scores
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        {[
          { icon: "🎯", label: "Overall Progress", value: `${overall.pct}%`, color: "#6c63ff" },
          { icon: "📋", label: "Completed Blocks", value: taskSummary.done, color: "#00e5a0" },
          { icon: "❌", label: "Missed Blocks", value: taskSummary.missed, color: "#ff4d6d" },
          { icon: "🔥", label: "Study Streak", value: `${state.streak} Days`, color: "#ffb347" }
        ].map((item, idx) => (
          <div key={idx} className="metric-widget anim-fade-up">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-2xl font-black" style={{ color: item.color }}>
              {item.value}
            </div>
            <div className="text-xs font-semibold text-white mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Lectures Done vs Remaining Chart */}
        <div className="card-3d p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
            📚 Lectures: Completed vs Remaining
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectBarData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyles} cursor={{ fill: "rgba(255, 255, 255, 0.03)" }} />
                <Legend wrapperStyle={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "11px" }} />
                <Bar dataKey="Done" stackId="a" fill="#6c63ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Remaining" stackId="a" fill="rgba(108, 99, 255, 0.2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lecture Distribution Pie Chart */}
        <div className="card-3d p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
            🍕 Done Lecture Distribution
          </h3>
          <div className="h-64 flex flex-col justify-between">
            {totalDoneLectures > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyles} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Mark some study lectures completed to see data distribution.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Lectures Completion Area Chart */}
      <div className="card-3d p-5">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
          📈 Weekly Complete-Lecture Trend
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyTrendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="colorLec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="week" tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10 }} />
              <YAxis tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyles} />
              <Area type="monotone" dataKey="Lectures" stroke="#6c63ff" fillOpacity={1} fill="url(#colorLec)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Test Scores and Consistency Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Test scores card */}
        <div className="card-3d p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
            🧪 Average Test Score by Subject
          </h3>
          {subjectTestScores.every((s) => s.count === 0) ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No tests recorded yet. Record tests in the Chapters tab to see statistics.
            </div>
          ) : (
            <div className="space-y-4">
              {subjectTestScores.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-semibold">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{item.count} test{item.count !== 1 ? "s" : ""}</span>
                      <span className="text-sm font-black" style={{ color: item.avg >= 80 ? "#00e5a0" : item.avg >= 60 ? "#ffb347" : item.count === 0 ? "rgba(255, 255, 255, 0.3)" : "#ff4d6d" }}>
                        {item.count > 0 ? `${item.avg}%` : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="progress-3d">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${item.avg}%`,
                        background: item.avg >= 80 ? "linear-gradient(90deg, #00b87a, #00e5a0)" : item.avg >= 60 ? "linear-gradient(90deg, #d4900f, #ffb347)" : item.count === 0 ? "transparent" : "linear-gradient(90deg, #c0243a, #ff4d6d)"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task completion status grid */}
        <div className="card-3d p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
              📋 Block Completion Statuses
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Done", value: taskSummary.done, color: "#00e5a0", icon: "✅" },
                { label: "Partial", value: taskSummary.partial, color: "#ffb347", icon: "📊" },
                { label: "Missed", value: taskSummary.missed, color: "#ff4d6d", icon: "❌" },
                { label: "Pending", value: taskSummary.pending, color: "#6c63ff", icon: "⏳" }
              ].map((item) => (
                <div key={item.label} className="metric-widget text-center py-4">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xl font-black" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs mt-1 text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1 text-slate-400">
              <span>Overall Consistency Score</span>
              <span className="font-bold text-white">{taskSummary.rate}%</span>
            </div>
            <div className="progress-3d" style={{ height: 12 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${taskSummary.rate}%`,
                  background: "linear-gradient(90deg, #6c63ff, #00d4ff)",
                  boxShadow: "0 0 15px rgba(108,99,255,0.4)"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* History of Test Results */}
      {testHistoryData.length > 0 && (
        <div className="card-3d p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">
            📊 Test Score Timeline
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={testHistoryData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 9 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyles} formatter={(val, name, props) => [`${val}%`, props.payload.subject]} />
                <Line
                  type="monotone"
                  dataKey="Score"
                  stroke="#00d4ff"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        key={props.key}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={payload.Score >= 80 ? "#00e5a0" : payload.Score >= 60 ? "#ffb347" : "#ff4d6d"}
                        stroke="none"
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
