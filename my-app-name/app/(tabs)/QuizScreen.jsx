// ─── QuizScreen.jsx ──────────────────────────────────────────────────────────
// Receives notes (string) as a prop. Generates MCQ questions via Gemini,
// then runs a lives-based quiz game with streaks and XP rewards.

import { useState } from "react";
import { callGemini } from "./shared.js";

// ── Helpers ──────────────────────────────────────────────────────────────────
const DIFFICULTIES = [
  { id: "easy",   emoji: "😊", label: "Easy" },
  { id: "medium", emoji: "😐", label: "Medium" },
  { id: "hard",   emoji: "😰", label: "Hard" },
  { id: "exam",   emoji: "💀", label: "Exam" },
];

const GRADE_INFO = {
  S: { color: "#facc15", label: "Outstanding!", icon: "🌟" },
  A: { color: "#22c55e", label: "Excellent!",   icon: "🏆" },
  B: { color: "#3da9fc", label: "Good job!",    icon: "⭐" },
  C: { color: "#ff8906", label: "Keep going!",  icon: "📚" },
  D: { color: "#f25f4c", label: "More study!",  icon: "💪" },
};

const calcGrade = (correctCount, total) => {
  const pct = total > 0 ? (correctCount / total) * 100 : 0;
  if (pct >= 90) return "S";
  if (pct >= 75) return "A";
  if (pct >= 60) return "B";
  if (pct >= 45) return "C";
  return "D";
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function QuizScreen({ notes, apiKeys, onXP, onBack }) {
  const [gameState,      setGameState]      = useState("setup");   // setup | playing | finished
  const [difficulty,     setDifficulty]     = useState("medium");
  const [numQ,           setNumQ]           = useState(5);
  const [questions,      setQuestions]      = useState([]);
  const [currentQ,       setCurrentQ]       = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerState,    setAnswerState]    = useState(null);      // correct | wrong | null
  const [lives,          setLives]          = useState(3);
  const [streak,         setStreak]         = useState(0);
  const [correctCount,   setCorrectCount]   = useState(0);
  const [totalXP,        setTotalXP]        = useState(0);
  const [isGenerating,   setIsGenerating]   = useState(false);
  const [error,          setError]          = useState("");

  // ── Generate questions ─────────────────────────────────────────────────
  const generateQuiz = async () => {
    setError(""); setIsGenerating(true);
    try {
      const raw = await callGemini(
        apiKeys.gemini,
        `Generate exactly ${numQ} multiple-choice quiz questions based on the notes below.
Difficulty level: ${difficulty}

Return ONLY valid JSON — no markdown fences, no extra text:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["A) option", "B) option", "C) option", "D) option"],
      "correct": 0,
      "explanation": "One sentence explaining why this is correct."
    }
  ]
}

Notes:
${notes}`,
        true
      );
      const parsed = JSON.parse(raw);
      if (!parsed.questions?.length) throw new Error("No questions returned.");
      setQuestions(parsed.questions);
      setCurrentQ(0); setSelectedAnswer(null); setAnswerState(null);
      setLives(3); setStreak(0); setCorrectCount(0); setTotalXP(0);
      setGameState("playing");
    } catch (e) {
      setError("Quiz generation failed: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Answer logic ───────────────────────────────────────────────────────
  const handleAnswer = (idx) => {
    if (answerState) return;
    setSelectedAnswer(idx);
    const isCorrect = idx === questions[currentQ].correct;
    setAnswerState(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const xp = 10 + (newStreak >= 3 ? 5 : 0);
      setTotalXP((prev) => prev + xp);
      setCorrectCount((prev) => prev + 1);
      onXP(xp, `Correct! +${xp} XP${newStreak >= 3 ? " 🔥" : ""}`);
    } else {
      setStreak(0);
      setLives((prev) => prev - 1);
    }
  };

  const nextQuestion = () => {
    const noLives   = lives - (answerState === "wrong" ? 0 : 0) <= 0;
    const lastQ     = currentQ >= questions.length - 1;
    if (lastQ || (answerState === "wrong" && lives <= 1)) {
      setGameState("finished");
    } else {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setAnswerState(null);
    }
  };

  const resetToSetup = () => {
    setGameState("setup"); setQuestions([]); setError("");
  };

  // ── Render: Setup ──────────────────────────────────────────────────────
  if (gameState === "setup") {
    return (
      <div className="screen">
        <div className="screen-header">
          <div>
            <button onClick={onBack} style={{
              background: "none", border: "none", color: "var(--muted)",
              fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 4,
              display: "flex", alignItems: "center", gap: 4
            }}>← Back to notes</button>
            <h2 className="screen-title">🎯 Quiz Game</h2>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>Test your knowledge</p>
          </div>
          <span className="badge badge-purple">Gemini AI</span>
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Notes preview */}
          <div className="card" style={{
            padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
            background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)"
          }}>
            <span style={{ fontSize: 22 }}>📝</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13 }}>Notes loaded</div>
              <div style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {notes.slice(0, 80)}{notes.length > 80 ? "…" : ""}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>⚙️ Quiz Settings</h3>

            {/* Difficulty */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: 8 }}>
                Difficulty
              </label>
              <div className="tabs">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    className={`tab ${difficulty === d.id ? "active" : ""}`}
                    onClick={() => setDifficulty(d.id)}
                  >
                    {d.emoji} {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question count */}
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>
                Questions:{" "}
                <strong style={{ color: "var(--accent)" }}>{numQ}</strong>
              </label>
              <input
                type="range" min={3} max={15} step={1} value={numQ}
                onChange={(e) => setNumQ(Number(e.target.value))}
                style={{ width: "100%", marginTop: 8, accentColor: "var(--accent)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                <span>3</span><span>15</span>
              </div>
            </div>
          </div>

          {/* Lives info */}
          <div className="card" style={{
            background: "rgba(242,95,76,0.08)", border: "1px solid rgba(242,95,76,0.2)",
            display: "flex", alignItems: "center", gap: 14
          }}>
            <div style={{ fontSize: 28, letterSpacing: 2 }}>❤️❤️❤️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>3 Lives · Streak Bonus</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Wrong answer = lose a life. 3+ correct in a row = +5 bonus XP!
              </div>
            </div>
          </div>

          {error && (
            <div className="card" style={{ background: "rgba(242,95,76,0.1)", border: "1px solid rgba(242,95,76,0.3)" }}>
              <p style={{ color: "var(--accent2)", fontSize: 13 }}>❌ {error}</p>
            </div>
          )}

          <button
            className="btn btn-primary btn-full"
            style={{ fontSize: 16, padding: "16px" }}
            onClick={generateQuiz}
            disabled={isGenerating}
          >
            {isGenerating
              ? <><div className="loading-spinner" /> Generating questions…</>
              : <>🎯 Start Quiz ({numQ} questions)</>}
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Results ────────────────────────────────────────────────────
  if (gameState === "finished") {
    const grade = calcGrade(correctCount, questions.length);
    const { color, label, icon } = GRADE_INFO[grade];
    const pct = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="screen">
        <div style={{ padding: "60px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 72, animation: "pulse 1.5s ease infinite" }}>{icon}</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginTop: 12 }}>Quiz Complete!</h2>
            <p style={{ color: "var(--muted)", marginTop: 4 }}>{label}</p>

            <div style={{
              fontSize: 88, fontWeight: 900, marginTop: 8, color,
              fontFamily: "'Space Mono', monospace",
              textShadow: `0 0 50px ${color}66`
            }}>{grade}</div>
            <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>{pct}% accuracy</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 24 }}>
              {[
                { label: "XP Earned",  value: totalXP,                 color: "var(--accent)" },
                { label: "Correct",    value: `${correctCount}/${questions.length}`, color: "var(--green)" },
                { label: "Lives Left", value: lives,                   color: "var(--accent4)" },
              ].map((s) => (
                <div key={s.label} className="card" style={{ background: "var(--surface2)", padding: "14px 8px" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onBack}>
                📝 New Notes
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={resetToSetup}>
                🔄 Retry Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Playing ────────────────────────────────────────────────────
  const q           = questions[currentQ];
  const progressPct = ((currentQ + (answerState ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="screen">
      {/* HUD */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(15,14,23,0.96)", backdropFilter: "blur(10px)",
        padding: "14px 20px 10px", borderBottom: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          {/* Lives */}
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3].map((i) => (
              <span key={i} style={{ fontSize: 18, opacity: i <= lives ? 1 : 0.2 }}>❤️</span>
            ))}
          </div>
          {/* Counter */}
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "var(--accent)" }}>
            {currentQ + 1} / {questions.length}
          </div>
          {/* Streak */}
          {streak >= 2 && (
            <div className="badge badge-orange">🔥 {streak}x</div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ background: "var(--surface2)", height: 4, borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progressPct}%`, borderRadius: 2,
            background: "linear-gradient(90deg, var(--accent4), var(--accent))",
            transition: "width 0.4s ease"
          }} />
        </div>
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Question card */}
        <div className="card" style={{
          background: "linear-gradient(135deg, var(--surface), #1e1b3a)",
          border: "1px solid rgba(61,169,252,0.25)"
        }}>
          <div className="badge badge-blue" style={{ marginBottom: 12 }}>
            Question {currentQ + 1}
          </div>
          <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.55 }}>{q.question}</p>
        </div>

        {/* Answer options */}
        {q.options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrect  = i === q.correct;
          let bg     = "var(--surface2)";
          let border = "var(--border)";
          let color  = "var(--text)";
          let anim   = "none";

          if (answerState) {
            if (isCorrect)               { bg = "rgba(34,197,94,0.15)"; border = "rgba(34,197,94,0.5)"; color = "#86efac"; }
            if (isSelected && !isCorrect){ bg = "rgba(242,95,76,0.15)"; border = "rgba(242,95,76,0.5)"; color = "#fca5a5"; }
            if (isSelected && isCorrect) anim = "correctBounce 0.5s ease";
            if (isSelected && !isCorrect)anim = "wrongShake 0.4s ease";
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={!!answerState}
              style={{
                background: bg, border: `1px solid ${border}`, borderRadius: 14,
                padding: "14px 16px", cursor: answerState ? "default" : "pointer",
                textAlign: "left", transition: "all 0.15s", color,
                fontFamily: "Nunito, sans-serif", fontSize: 14, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 12,
                animation: isSelected ? anim : "none",
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: "50%", background: "var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontFamily: "'Space Mono', monospace", flexShrink: 0, color: "var(--muted)"
              }}>
                {["A","B","C","D"][i]}
              </span>
              {opt.replace(/^[A-D]\)\s*/i, "")}
            </button>
          );
        })}

        {/* Explanation + next */}
        {answerState && (
          <div style={{ animation: "fadeUp 0.3s ease", display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="card" style={{
              background: answerState === "correct" ? "rgba(34,197,94,0.1)" : "rgba(242,95,76,0.1)",
              border: `1px solid ${answerState === "correct" ? "rgba(34,197,94,0.3)" : "rgba(242,95,76,0.3)"}`,
            }}>
              <div style={{ fontWeight: 800, marginBottom: 6, color: answerState === "correct" ? "var(--green)" : "var(--accent2)" }}>
                {answerState === "correct" ? "✅ Correct!" : "❌ Incorrect"}
                {answerState === "correct" && streak >= 3 && <span style={{ marginLeft: 8 }}>🔥 Streak bonus!</span>}
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{q.explanation}</p>
            </div>
            <button className="btn btn-primary btn-full" onClick={nextQuestion}>
              {currentQ >= questions.length - 1 || lives <= 1 ? "See Results →" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
