// ─── App.jsx ─────────────────────────────────────────────────────────────────
// Root component. Handles:
//   • Onboarding (API key entry)
//   • Global state: pet XP, tasks, stats, XP toast
//   • Navigation between Home, Upload, Podcast, Quiz, and Pet screens
//   • Passing notes from UploadScreen into PodcastScreen / QuizScreen

import { useState, useCallback } from "react";
import { globalStyles, getPetStage } from "./shared.js";
import UploadScreen  from "./UploadScreen.jsx";
import PodcastScreen from "./PodcastScreen.jsx";
import QuizScreen    from "./QuizScreen.jsx";
import PetScreen     from "./PetScreen.jsx";

// ── Onboarding ────────────────────────────────────────────────────────────────
function OnboardingScreen({ onComplete }) {
  const [gemini,      setGemini]      = useState("");
  const [elevenlabs,  setElevenlabs]  = useState("");
  const [voiceId,     setVoiceId]     = useState("JBFqnCBsd6RMkjVDRZzb");
  const [petName,     setPetName]     = useState("Ember");

  return (
    <div style={{
      minHeight: "100vh", padding: "40px 24px",
      display: "flex", flexDirection: "column", gap: 22
    }}>
      {/* Hero */}
      <div style={{ textAlign: "center", paddingTop: 24 }}>
        <div style={{ fontSize: 72, animation: "float 3s ease-in-out infinite" }}>🐉</div>
        <h1 style={{ fontSize: 34, fontWeight: 900, marginTop: 14, letterSpacing: -1 }}>
          Study<span style={{ color: "var(--accent)" }}>Pet</span>
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 15, lineHeight: 1.6 }}>
          Your AI-powered study companion.<br />Enter your API keys to begin.
        </p>
      </div>

      {/* Keys */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {[
          {
            label: "Gemini API Key",
            type: "password",
            placeholder: "AIzaSy…",
            value: gemini,
            setter: setGemini,
            hint: "aistudio.google.com — quiz generation & podcast scripts",
          },
          {
            label: "ElevenLabs API Key",
            type: "password",
            placeholder: "sk_…",
            value: elevenlabs,
            setter: setElevenlabs,
            hint: "elevenlabs.io — text-to-speech podcast audio",
          },
          {
            label: "ElevenLabs Voice ID (optional)",
            type: "text",
            placeholder: "JBFqnCBsd6RMkjVDRZzb (default)",
            value: voiceId,
            setter: setVoiceId,
            hint: "Leave blank for the default voice",
          },
          {
            label: "Pet Name",
            type: "text",
            placeholder: "Ember",
            value: petName,
            setter: setPetName,
            hint: "What will you name your companion?",
          },
        ].map(({ label, type, placeholder, value, setter, hint }) => (
          <div key={label}>
            <label style={{
              fontSize: 12, fontWeight: 700, color: "var(--muted)",
              textTransform: "uppercase", letterSpacing: 1
            }}>
              {label}
            </label>
            <input
              className="input"
              style={{ marginTop: 8 }}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setter(e.target.value)}
            />
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>{hint}</p>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary btn-full"
        style={{ fontSize: 17, padding: "16px" }}
        disabled={!gemini.trim() || !elevenlabs.trim()}
        onClick={() => onComplete({
          gemini:     gemini.trim(),
          elevenlabs: elevenlabs.trim(),
          voiceId:    voiceId.trim() || "JBFqnCBsd6RMkjVDRZzb",
          petName:    petName.trim() || "Ember",
        })}
      >
        ✨ Launch StudyPet
      </button>

      <div className="card" style={{
        background: "rgba(61,169,252,0.07)", border: "1px solid rgba(61,169,252,0.2)"
      }}>
        <p style={{ fontSize: 12, color: "var(--accent4)", lineHeight: 1.7 }}>
          <strong>🔒 Privacy:</strong> Keys are stored only in-memory for this session and sent
          only to Google (Gemini) and ElevenLabs. Nothing is stored on any server.
        </p>
      </div>
    </div>
  );
}

// ── Home screen ───────────────────────────────────────────────────────────────
function HomeScreen({ pet, stats, setTab }) {
  const stage = getPetStage(pet.xp);

  const cards = [
    { tab: "upload",  icon: "📄", title: "Upload Notes", desc: "Load your notes to study from", color: "#3da9fc",  badge: "Start Here" },
    { tab: "podcast", icon: "🎙️", title: "Podcast",      desc: "Convert notes to audio",       color: "#ff8906",  badge: "ElevenLabs" },
    { tab: "quiz",    icon: "🎯", title: "Quiz Game",    desc: "Test your knowledge",           color: "#a78bfa",  badge: "Gemini AI" },
    { tab: "pet",     icon: stage.emoji, title: "Your Pet", desc: `${stage.name} · ${pet.xp} XP`, color: "#22c55e", badge: `Lv.${["Egg","Hatchling","Baby Dragon","Dragon","Elder Dragon"].indexOf(stage.name)+1}` },
  ];

  return (
    <div className="screen">
      <div style={{
        padding: "56px 20px 20px",
        background: "linear-gradient(180deg, rgba(124,58,237,0.13) 0%, transparent 100%)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>
              {new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
            </p>
            <h1 style={{ fontSize: 30, fontWeight: 900, marginTop: 4, letterSpacing: -0.5 }}>
              Study<span style={{ color: "var(--accent)" }}>Pet</span> 🐉
            </h1>
          </div>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "10px 14px", textAlign: "center", cursor: "pointer"
          }}
            onClick={() => setTab("pet")}
          >
            <div style={{ fontSize: 26, animation: "float 3s ease-in-out infinite" }}>{stage.emoji}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", marginTop: 4 }}>{pet.xp} XP</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {[
            { v: pet.xp,             l: "XP",      c: "var(--accent)" },
            { v: stats.quizzesDone,  l: "Quizzes", c: "var(--accent4)" },
            { v: stats.podcastsDone, l: "Podcasts", c: "#a78bfa" },
            { v: stats.tasksCompleted, l: "Tasks",  c: "var(--green)" },
          ].map((s) => (
            <div key={s.l} className="card" style={{ padding: "10px 0", textAlign: "center" }}>
              <div style={{
                fontSize: 19, fontWeight: 900, color: s.c,
                fontFamily: "'Space Mono', monospace"
              }}>{s.v}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <h2 style={{ fontSize: 16, fontWeight: 900, marginTop: 4, letterSpacing: -0.3 }}>Features</h2>
        {cards.map((c) => (
          <button
            key={c.tab}
            onClick={() => setTab(c.tab)}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "17px 18px", cursor: "pointer",
              textAlign: "left", width: "100%", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 16,
              fontFamily: "Nunito, sans-serif"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = c.color;
              e.currentTarget.style.background = `${c.color}0d`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--surface)";
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `${c.color}18`, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 26, flexShrink: 0
            }}>{c.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 16, fontWeight: 900 }}>{c.title}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px",
                  borderRadius: 99, background: `${c.color}22`, color: c.color
                }}>{c.badge}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>{c.desc}</p>
            </div>
            <span style={{ color: "var(--muted)", fontSize: 20 }}>›</span>
          </button>
        ))}

        {/* Tip */}
        <div className="card" style={{
          background: "linear-gradient(135deg,rgba(255,137,6,0.09),rgba(242,95,76,0.09))",
          border: "1px solid rgba(255,137,6,0.2)"
        }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text)" }}>Start here:</strong> Upload your notes first,
              then turn them into a podcast or a quiz. Your pet earns XP every time you study!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [apiKeys,  setApiKeys]  = useState(null);
  const [tab,      setTab]      = useState("home");
  const [notes,    setNotes]    = useState("");   // shared notes between Upload→Podcast/Quiz
  const [xpToast,  setXpToast]  = useState(null);
  const [tasks,    setTasks]    = useState([
    { id: 1, text: "Read Chapter 1 notes",        done: false },
    { id: 2, text: "Review flashcards for 15 min", done: false },
  ]);
  const [pet, setPet] = useState({
    name: "Ember", xp: 0, streak: 0, quizzesDone: 0, podcastsDone: 0
  });
  const [stats, setStats] = useState({
    quizzesDone: 0, podcastsDone: 0, tasksCompleted: 0
  });

  // ── XP helper ──────────────────────────────────────────────────────────
  const gainXP = useCallback((amount, msg) => {
    setPet((p) => ({ ...p, xp: p.xp + amount }));
    if (msg) {
      setXpToast(msg);
      setTimeout(() => setXpToast(null), 2200);
    }
  }, []);

  const onPodcastXP = useCallback((amount, msg) => {
    gainXP(amount, msg);
    if (msg?.includes("audio")) {
      setPet((p) => ({ ...p, podcastsDone: p.podcastsDone + 1 }));
      setStats((s) => ({ ...s, podcastsDone: s.podcastsDone + 1 }));
    }
  }, [gainXP]);

  const onQuizXP = useCallback((amount, msg) => {
    gainXP(amount, msg);
  }, [gainXP]);

  // ── Task helpers ───────────────────────────────────────────────────────
  const addTask = (text) => setTasks((t) => [...t, { id: Date.now(), text, done: false }]);

  const completeTask = (id) => {
    setTasks((t) => t.map((task) => task.id === id ? { ...task, done: true } : task));
    setPet((p) => ({ ...p, streak: p.streak + 1 }));
    setStats((s) => ({ ...s, tasksCompleted: s.tasksCompleted + 1 }));
  };

  // ── Navigation from Upload ─────────────────────────────────────────────
  const goToPodcast = (text) => { setNotes(text); setTab("podcast"); };
  const goToQuiz    = (text) => { setNotes(text); setTab("quiz"); };

  // ── Nav items ──────────────────────────────────────────────────────────
  const NAV = [
    { id: "home",    icon: "🏠", label: "Home" },
    { id: "upload",  icon: "📄", label: "Notes" },
    { id: "podcast", icon: "🎙️", label: "Podcast" },
    { id: "quiz",    icon: "🎯", label: "Quiz" },
    { id: "pet",     icon: "🐾", label: "Pet" },
  ];

  // ── Onboarding gate ────────────────────────────────────────────────────
  if (!apiKeys) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="app-root">
          <OnboardingScreen onComplete={(keys) => {
            setApiKeys(keys);
            setPet((p) => ({ ...p, name: keys.petName }));
          }} />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className="app-root">
        {/* XP toast */}
        {xpToast && <div className="xp-toast">⚡ {xpToast}</div>}

        {/* Scrollable content area */}
        <div style={{ overflowY: "auto", height: "100vh" }}>
          {tab === "home" && (
            <HomeScreen pet={pet} stats={stats} setTab={setTab} />
          )}
          {tab === "upload" && (
            <UploadScreen onGoToPodcast={goToPodcast} onGoToQuiz={goToQuiz} />
          )}
          {tab === "podcast" && (
            <PodcastScreen
              notes={notes}
              apiKeys={apiKeys}
              onXP={onPodcastXP}
              onBack={() => setTab("upload")}
            />
          )}
          {tab === "quiz" && (
            <QuizScreen
              notes={notes}
              apiKeys={apiKeys}
              onXP={onQuizXP}
              onBack={() => setTab("upload")}
            />
          )}
          {tab === "pet" && (
            <PetScreen
              pet={pet}
              onFeedXP={gainXP}
              tasks={tasks}
              onAddTask={addTask}
              onCompleteTask={completeTask}
            />
          )}
        </div>

        {/* Bottom nav */}
        <nav className="bottom-nav">
          {NAV.map((n) => (
            <div
              key={n.id}
              className={`nav-item ${tab === n.id ? "active" : ""}`}
              onClick={() => setTab(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
