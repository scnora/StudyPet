// ─── PetScreen.jsx ───────────────────────────────────────────────────────────
// Shows the pet companion with XP progress, evolution stages, and a study
// task tracker. Each completed task awards XP to the pet.

import { useState } from "react";
import { PET_STAGES, getPetStage } from "./shared.js";

// ── Stat mini-card ────────────────────────────────────────────────────────────
const StatBox = ({ emoji, label, value }) => (
  <div style={{
    background: "var(--surface2)", borderRadius: 12,
    padding: "10px 4px", textAlign: "center"
  }}>
    <div style={{ fontSize: 18 }}>{emoji}</div>
    <div style={{ fontWeight: 900, fontSize: 18, color: "var(--text)", marginTop: 2 }}>{value}</div>
    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>{label}</div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function PetScreen({ pet, onFeedXP, tasks, onAddTask, onCompleteTask }) {
  const [taskInput, setTaskInput] = useState("");
  const [isHappy,   setIsHappy]   = useState(false);
  const [filter,    setFilter]    = useState("all"); // all | active | done

  const stage    = getPetStage(pet.xp);
  const stageIdx = PET_STAGES.indexOf(stage);
  const nextStage = PET_STAGES[Math.min(stageIdx + 1, PET_STAGES.length - 1)];
  const isMaxed   = stage === nextStage;
  const xpToNext  = isMaxed ? 0 : nextStage.hpRequired - pet.xp;
  const hpPct     = isMaxed
    ? 100
    : Math.min(100, ((pet.xp - stage.hpRequired) / (nextStage.hpRequired - stage.hpRequired)) * 100);

  const handlePet = () => {
    setIsHappy(true);
    setTimeout(() => setIsHappy(false), 2000);
  };

  const handleComplete = (task) => {
    onCompleteTask(task.id);
    setIsHappy(true);
    setTimeout(() => setIsHappy(false), 2000);
    onFeedXP(25, "Task done! +25 XP");
  };

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    onAddTask(taskInput.trim());
    setTaskInput("");
  };

  const visibleTasks = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done")   return t.done;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.done).length;
  const doneCount    = tasks.filter((t) => t.done).length;

  return (
    <div className="screen">
      {/* ── Header ── */}
      <div className="screen-header">
        <div>
          <h2 className="screen-title">🐾 Your Pet</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>Study hard to evolve!</p>
        </div>
        <div className="badge badge-purple">
          ⭐ Lv.{stageIdx + 1}
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Pet display card ── */}
        <div className="card" style={{
          textAlign: "center", padding: "32px 20px",
          background: `linear-gradient(145deg, var(--surface), ${stage.color}12)`,
          position: "relative", overflow: "hidden"
        }}>
          {/* Ambient glow */}
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(circle at 50% 35%, ${stage.color}1a, transparent 65%)`,
            pointerEvents: "none"
          }} />

          {/* Pet emoji */}
          <div
            onClick={handlePet}
            title="Pet me!"
            style={{
              fontSize: 88, display: "inline-block", cursor: "pointer",
              userSelect: "none", lineHeight: 1,
              animation: isHappy
                ? "wiggle 0.4s ease 3, float 3s 1.2s ease-in-out infinite"
                : "float 3s ease-in-out infinite",
            }}
          >
            {stage.emoji}
          </div>

          <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 14 }}>{pet.name}</h3>
          <div className="badge badge-purple" style={{ marginTop: 6 }}>{stage.name}</div>

          {/* XP bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>XP Progress</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: stage.color }}>
                {pet.xp} XP
                {!isMaxed ? ` · ${xpToNext} to ${nextStage.name}` : " · MAX LEVEL!"}
              </span>
            </div>
            <div className="hp-bar-track">
              <div
                className="hp-bar-fill"
                style={{ width: `${hpPct}%`, background: `linear-gradient(90deg, ${stage.color}, ${stage.color}99)` }}
              />
            </div>
          </div>

          {/* Stat row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 18 }}>
            <StatBox emoji="🔥" label="Streak"   value={`${pet.streak}d`} />
            <StatBox emoji="🎯" label="Quizzes"  value={pet.quizzesDone} />
            <StatBox emoji="🎙️" label="Podcasts" value={pet.podcastsDone} />
          </div>
        </div>

        {/* ── Evolution path ── */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>🌟 Evolution Path</h3>
          <div style={{ display: "flex", alignItems: "center" }}>
            {PET_STAGES.map((s, i) => {
              const unlocked  = pet.xp >= s.hpRequired;
              const isCurrent = s === stage;
              return (
                <div key={s.name} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    flex: 1, opacity: unlocked ? 1 : 0.35
                  }}>
                    <div style={{
                      fontSize: isCurrent ? 30 : 20,
                      padding: 6, borderRadius: "50%",
                      background: isCurrent ? `${s.color}22` : "transparent",
                      border: isCurrent ? `2px solid ${s.color}` : "2px solid transparent",
                      animation: isCurrent ? "pulse 2s ease infinite" : "none",
                      transition: "all 0.3s"
                    }}>
                      {s.emoji}
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, marginTop: 4, textAlign: "center",
                      color: unlocked ? s.color : "var(--muted)"
                    }}>
                      {s.name}
                    </span>
                    <span style={{ fontSize: 9, color: "var(--muted)", marginTop: 1 }}>
                      {s.hpRequired} XP
                    </span>
                  </div>
                  {i < PET_STAGES.length - 1 && (
                    <div style={{
                      height: 2, flex: 0.25, borderRadius: 1,
                      background: pet.xp >= PET_STAGES[i + 1].hpRequired ? "var(--green)" : "var(--border)"
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Study Tasks ── */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>
              📋 Study Tasks
            </h3>
            <span className="badge badge-orange">+25 XP each</span>
          </div>

          {/* Add task */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              className="input"
              placeholder="Add a study task…"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddTask}
              style={{ flexShrink: 0 }}
            >
              ＋
            </button>
          </div>

          {/* Filter tabs */}
          {tasks.length > 0 && (
            <div className="tabs" style={{ marginBottom: 12 }}>
              {[
                { id: "all",    label: `All (${tasks.length})` },
                { id: "active", label: `Active (${pendingCount})` },
                { id: "done",   label: `Done (${doneCount})` },
              ].map((t) => (
                <button
                  key={t.id}
                  className={`tab ${filter === t.id ? "active" : ""}`}
                  onClick={() => setFilter(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Task list */}
          {visibleTasks.length === 0 && (
            <p style={{ color: "var(--muted)", textAlign: "center", fontSize: 13, padding: "16px 0" }}>
              {tasks.length === 0
                ? "No tasks yet. Add some to earn XP! 🐉"
                : "No tasks in this filter."}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {visibleTasks.map((task) => (
              <div
                key={task.id}
                className="card"
                style={{
                  padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
                  background: task.done ? "rgba(34,197,94,0.07)" : "var(--surface2)",
                  border: `1px solid ${task.done ? "rgba(34,197,94,0.2)" : "var(--border)"}`,
                  opacity: task.done ? 0.65 : 1, transition: "all 0.2s"
                }}
              >
                <button
                  onClick={() => !task.done && handleComplete(task)}
                  style={{
                    width: 26, height: 26, borderRadius: "50%", border: "none",
                    background: task.done ? "var(--green)" : "var(--surface)",
                    cursor: task.done ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, flexShrink: 0,
                    color: task.done ? "#0f0e17" : "var(--muted)",
                    fontWeight: 900, transition: "all 0.2s"
                  }}
                >
                  {task.done ? "✓" : "○"}
                </button>
                <span style={{
                  fontSize: 14, flex: 1,
                  textDecoration: task.done ? "line-through" : "none",
                  color: task.done ? "var(--muted)" : "var(--text)"
                }}>
                  {task.text}
                </span>
                {task.done
                  ? <span className="badge badge-green" style={{ fontSize: 10 }}>+25 XP</span>
                  : <span style={{ fontSize: 12, color: "var(--muted)" }}>○</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── How to earn XP ── */}
        <div className="card" style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(255,137,6,0.1))",
          border: "1px solid rgba(124,58,237,0.2)"
        }}>
          <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>⚡ How to earn XP</h4>
          {[
            { icon: "📋", label: "Complete a study task",    xp: "+25" },
            { icon: "🧠", label: "Generate podcast script",  xp: "+30" },
            { icon: "🎤", label: "Create podcast audio",     xp: "+50" },
            { icon: "✅", label: "Quiz correct answer",      xp: "+10" },
            { icon: "🔥", label: "3+ correct in a row",      xp: "+5 bonus" },
          ].map((row) => (
            <div key={row.label} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "6px 0", borderBottom: "1px solid var(--border)"
            }}>
              <span style={{ fontSize: 16 }}>{row.icon}</span>
              <span style={{ flex: 1, fontSize: 13, color: "var(--muted)" }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--green)", fontFamily: "'Space Mono', monospace" }}>
                {row.xp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
