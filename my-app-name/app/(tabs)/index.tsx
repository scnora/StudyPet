import { useState, useEffect, useRef, useCallback } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Nunito', sans-serif;
    background: #0f0e17;
    color: #fffffe;
    min-height: 100vh;
    overflow-x: hidden;
  }

  :root {
    --bg: #0f0e17;
    --surface: #1a1829;
    --surface2: #232136;
    --accent: #ff8906;
    --accent2: #f25f4c;
    --accent3: #e53170;
    --accent4: #3da9fc;
    --accent5: #7c3aed;
    --green: #22c55e;
    --yellow: #facc15;
    --text: #fffffe;
    --muted: #a7a9be;
    --border: rgba(255,255,255,0.08);
    --radius: 16px;
    --shadow: 0 8px 32px rgba(0,0,0,0.4);
  }

  .app-root {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    position: relative;
    background: var(--bg);
    overflow: hidden;
  }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ANIMATIONS */
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
  @keyframes wiggle { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes hpFill { from { width: 0%; } to { width: var(--hp-pct); } }
  @keyframes particlePop {
    0% { transform: scale(0) translate(0,0); opacity:1; }
    100% { transform: scale(1) translate(var(--px), var(--py)); opacity:0; }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
  @keyframes soundBar { 0%,100% { height: 4px; } 50% { height: 20px; } }
  @keyframes correctBounce { 0%,100% { transform:scale(1); } 30% { transform:scale(1.15); } 60% { transform:scale(0.95); } }
  @keyframes wrongShake { 0%,100% { transform:translateX(0); } 20%,60% { transform:translateX(-6px); } 40%,80% { transform:translateX(6px); } }

  /* BUTTONS */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 24px; border: none; border-radius: 12px;
    font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 15px;
    cursor: pointer; transition: all 0.15s ease; user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .btn:active { transform: scale(0.96); }
  .btn-primary { background: var(--accent); color: #0f0e17; }
  .btn-primary:hover { background: #ffaa44; }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { background: #2d2b44; }
  .btn-danger { background: var(--accent2); color: white; }
  .btn-success { background: var(--green); color: #0f0e17; }
  .btn-full { width: 100%; }
  .btn-sm { padding: 8px 16px; font-size: 13px; border-radius: 10px; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

  /* CARD */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }

  /* INPUT */
  .input, .textarea {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 12px; color: var(--text); font-family: 'Nunito', sans-serif;
    font-size: 14px; padding: 12px 16px; outline: none;
    transition: border-color 0.2s;
  }
  .input:focus, .textarea:focus { border-color: var(--accent4); }
  .textarea { resize: vertical; min-height: 120px; line-height: 1.5; }

  /* BADGE */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 700;
  }
  .badge-orange { background: rgba(255,137,6,0.18); color: var(--accent); }
  .badge-blue { background: rgba(61,169,252,0.18); color: var(--accent4); }
  .badge-green { background: rgba(34,197,94,0.18); color: var(--green); }
  .badge-purple { background: rgba(124,58,237,0.18); color: #a78bfa; }
  .badge-red { background: rgba(242,95,76,0.18); color: var(--accent2); }

  /* NAV */
  .bottom-nav {
    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 100%; max-width: 430px;
    background: rgba(26,24,41,0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex; padding: 8px 0 20px;
    z-index: 100;
  }
  .nav-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
    cursor: pointer; padding: 6px 0; transition: all 0.2s;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-item .nav-icon { font-size: 22px; transition: transform 0.2s; }
  .nav-item .nav-label { font-size: 10px; font-weight: 700; color: var(--muted); transition: color 0.2s; }
  .nav-item.active .nav-label { color: var(--accent); }
  .nav-item.active .nav-icon { transform: scale(1.2); }

  /* HEADER */
  .screen-header {
    padding: 56px 20px 16px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .screen-title {
    font-size: 26px; font-weight: 900; letter-spacing: -0.5px;
  }

  /* LOADING */
  .loading-spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  /* HP BAR */
  .hp-bar-track {
    height: 10px; background: var(--surface2); border-radius: 99px; overflow: hidden;
  }
  .hp-bar-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, var(--green), #86efac);
    transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* XP TOAST */
  .xp-toast {
    position: fixed; top: 60px; right: 16px;
    background: var(--green); color: #0f0e17;
    padding: 8px 16px; border-radius: 99px;
    font-weight: 800; font-size: 14px;
    animation: fadeUp 0.3s ease, fadeUp 0.3s ease 1.5s reverse forwards;
    z-index: 999; pointer-events: none;
  }

  /* TABS */
  .tabs {
    display: flex; gap: 4px; padding: 4px;
    background: var(--surface2); border-radius: 12px;
  }
  .tab {
    flex: 1; padding: 8px 4px; border: none; background: transparent;
    color: var(--muted); font-family: 'Nunito', sans-serif; font-weight: 700;
    font-size: 13px; border-radius: 10px; cursor: pointer; transition: all 0.2s;
  }
  .tab.active { background: var(--accent); color: #0f0e17; }

  /* SOUND WAVE */
  .sound-wave {
    display: flex; align-items: center; gap: 3px; height: 24px;
  }
  .sound-bar {
    width: 3px; background: var(--accent); border-radius: 2px;
    animation: soundBar 0.8s ease-in-out infinite;
  }
  .sound-bar:nth-child(2) { animation-delay: 0.1s; }
  .sound-bar:nth-child(3) { animation-delay: 0.2s; }
  .sound-bar:nth-child(4) { animation-delay: 0.3s; }
  .sound-bar:nth-child(5) { animation-delay: 0.15s; }

  /* DRAG DROP ZONE */
  .drop-zone {
    border: 2px dashed var(--border); border-radius: 16px;
    padding: 32px 20px; text-align: center; cursor: pointer;
    transition: all 0.2s;
  }
  .drop-zone:hover, .drop-zone.drag-over {
    border-color: var(--accent4); background: rgba(61,169,252,0.06);
  }

  /* SCREEN */
  .screen { padding: 0 0 90px; animation: fadeUp 0.3s ease; }

  /* PROGRESS RING */
  .progress-ring-track { fill: none; stroke: var(--surface2); }
  .progress-ring-fill { fill: none; stroke: var(--accent); stroke-linecap: round;
    transition: stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1); }
`;

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, style = {} }) => {
  const icons = {
    home: "🏠", notes: "📝", quiz: "🎯", pet: "🐾", podcast: "🎙️",
    upload: "📤", play: "▶️", pause: "⏸️", stop: "⏹️", mic: "🎤",
    star: "⭐", heart: "❤️", bolt: "⚡", trophy: "🏆", fire: "🔥",
    check: "✅", wrong: "❌", question: "❓", gear: "⚙️", back: "←",
    refresh: "🔄", plus: "➕", sparkle: "✨", brain: "🧠", book: "📚",
    music: "🎵", wave: "〰️", egg: "🥚", cat: "🐱", dragon: "🐉",
    sword: "⚔️", shield: "🛡️", potion: "🧪", gem: "💎",
  };
  return <span style={{ fontSize: size, lineHeight: 1, ...style }}>{icons[name] || "•"}</span>;
};

// ─── API HELPERS ─────────────────────────────────────────────────────────────
const callGemini = async (apiKey, prompt, jsonMode = false) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: jsonMode
      ? { responseMimeType: "application/json", temperature: 0.7 }
      : { temperature: 0.7 },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const callElevenLabs = async (apiKey, text, voiceId = "JBFqnCBsd6RMkjVDRZzb") => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.8 },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs error: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

// ─── ONBOARDING / API KEYS SCREEN ─────────────────────────────────────────────
const OnboardingScreen = ({ onComplete }) => {
  const [gemini, setGemini] = useState("");
  const [elevenlabs, setElevenlabs] = useState("");
  const [voiceId, setVoiceId] = useState("JBFqnCBsd6RMkjVDRZzb");

  return (
    <div style={{ minHeight: "100vh", padding: "40px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ textAlign: "center", paddingTop: 20 }}>
        <div style={{ fontSize: 64, animation: "float 3s ease-in-out infinite" }}>🐉</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginTop: 12, letterSpacing: -1 }}>
          Study<span style={{ color: "var(--accent)" }}>Pet</span>
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 15 }}>
          Your AI-powered study companion.<br />Enter your API keys to begin.
        </p>
      </div>

      <div className="card" style={{ gap: 16, display: "flex", flexDirection: "column" }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            Gemini API Key
          </label>
          <input
            className="input"
            style={{ marginTop: 8 }}
            type="password"
            placeholder="AIzaSy..."
            value={gemini}
            onChange={e => setGemini(e.target.value)}
          />
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
            From <span style={{ color: "var(--accent4)" }}>aistudio.google.com</span> — Used for quiz generation &amp; podcast scripts
          </p>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            ElevenLabs API Key
          </label>
          <input
            className="input"
            style={{ marginTop: 8 }}
            type="password"
            placeholder="sk_..."
            value={elevenlabs}
            onChange={e => setElevenlabs(e.target.value)}
          />
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
            From <span style={{ color: "var(--accent4)" }}>elevenlabs.io</span> — Used for text-to-speech podcast
          </p>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            ElevenLabs Voice ID <span style={{ fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            className="input"
            style={{ marginTop: 8 }}
            placeholder="JBFqnCBsd6RMkjVDRZzb (default)"
            value={voiceId}
            onChange={e => setVoiceId(e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn btn-primary btn-full"
        style={{ fontSize: 17, padding: "16px" }}
        disabled={!gemini || !elevenlabs}
        onClick={() => onComplete({ gemini, elevenlabs, voiceId: voiceId || "JBFqnCBsd6RMkjVDRZzb" })}
      >
        <Icon name="sparkle" /> Launch StudyPet
      </button>

      <div className="card" style={{ background: "rgba(61,169,252,0.08)", border: "1px solid rgba(61,169,252,0.2)" }}>
        <p style={{ fontSize: 12, color: "var(--accent4)", lineHeight: 1.6 }}>
          <strong>🔒 Privacy:</strong> Your API keys are stored only in memory during this session and never sent anywhere except the respective APIs (Google &amp; ElevenLabs).
        </p>
      </div>
    </div>
  );
};

// ─── PET COMPONENT ────────────────────────────────────────────────────────────
const PET_STAGES = [
  { name: "Egg", emoji: "🥚", hpRequired: 0, color: "#a78bfa" },
  { name: "Hatchling", emoji: "🐣", hpRequired: 100, color: "#facc15" },
  { name: "Baby Dragon", emoji: "🐲", hpRequired: 300, color: "#86efac" },
  { name: "Dragon", emoji: "🐉", hpRequired: 600, color: "#ff8906" },
  { name: "Elder Dragon", emoji: "✨🐉✨", hpRequired: 1000, color: "#f25f4c" },
];

const getPetStage = (xp) => {
  let stage = PET_STAGES[0];
  for (const s of PET_STAGES) {
    if (xp >= s.hpRequired) stage = s;
  }
  return stage;
};

const PetScreen = ({ pet, onFeedXP, tasks, onAddTask, onCompleteTask }) => {
  const [taskInput, setTaskInput] = useState("");
  const [isHappy, setIsHappy] = useState(false);
  const stage = getPetStage(pet.xp);
  const nextStage = PET_STAGES[Math.min(PET_STAGES.indexOf(stage) + 1, PET_STAGES.length - 1)];
  const xpToNext = nextStage.hpRequired - pet.xp;
  const hpPct = Math.min(100, ((pet.xp - stage.hpRequired) / Math.max(1, nextStage.hpRequired - stage.hpRequired)) * 100);

  const handleComplete = (task) => {
    onCompleteTask(task.id);
    setIsHappy(true);
    setTimeout(() => setIsHappy(false), 2000);
    onFeedXP(25, "Task completed! +25 XP");
  };

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    onAddTask(taskInput.trim());
    setTaskInput("");
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h2 className="screen-title">🐾 Your Pet</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>Study to level up!</p>
        </div>
        <div className="badge badge-purple">
          <Icon name="star" size={12} /> Lv.{PET_STAGES.indexOf(stage) + 1}
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Pet Display */}
        <div className="card" style={{
          textAlign: "center", padding: "32px 20px",
          background: `linear-gradient(135deg, var(--surface), rgba(${stage.color === "#ff8906" ? "255,137,6" : "124,58,237"},0.1))`,
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: `radial-gradient(circle at 50% 40%, ${stage.color}18 0%, transparent 70%)`,
            pointerEvents: "none"
          }} />

          <div style={{
            fontSize: 80,
            animation: isHappy ? "wiggle 0.5s ease 3, float 3s ease-in-out infinite" : "float 3s ease-in-out infinite",
            display: "inline-block", cursor: "pointer", userSelect: "none"
          }}
            onClick={() => { setIsHappy(true); setTimeout(() => setIsHappy(false), 2000); }}
          >
            {stage.emoji}
          </div>

          <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 12 }}>{pet.name}</h3>
          <div className="badge badge-purple" style={{ marginTop: 6 }}>{stage.name}</div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>XP Progress</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: stage.color }}>
                {pet.xp} XP {nextStage !== stage ? `• ${xpToNext} to ${nextStage.name}` : "• MAX!"}
              </span>
            </div>
            <div className="hp-bar-track">
              <div className="hp-bar-fill" style={{
                width: `${hpPct}%`,
                background: `linear-gradient(90deg, ${stage.color}, ${stage.color}aa)`
              }} />
            </div>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20
          }}>
            {[
              { icon: "fire", label: "Streak", value: `${pet.streak}d` },
              { icon: "quiz", label: "Quizzes", value: pet.quizzesDone },
              { icon: "podcast", label: "Podcasts", value: pet.podcastsDone },
            ].map(s => (
              <div key={s.label} style={{
                background: "var(--surface2)", borderRadius: 12, padding: "10px 0"
              }}>
                <div style={{ fontSize: 18 }}><Icon name={s.icon} size={18} /></div>
                <div style={{ fontWeight: 900, fontSize: 18, color: "var(--text)" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Evolution Path */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>🌟 Evolution Path</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {PET_STAGES.map((s, i) => {
              const unlocked = pet.xp >= s.hpRequired;
              const isCurrent = s === stage;
              return (
                <div key={s.name} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    opacity: unlocked ? 1 : 0.4, flex: 1
                  }}>
                    <div style={{
                      fontSize: isCurrent ? 28 : 20,
                      padding: 6, borderRadius: "50%",
                      background: isCurrent ? `${s.color}22` : "transparent",
                      border: isCurrent ? `2px solid ${s.color}` : "none",
                      animation: isCurrent ? "pulse 2s ease infinite" : "none"
                    }}>{s.emoji}</div>
                    <span style={{ fontSize: 9, color: unlocked ? s.color : "var(--muted)", fontWeight: 700, marginTop: 2, textAlign: "center" }}>
                      {s.name}
                    </span>
                  </div>
                  {i < PET_STAGES.length - 1 && (
                    <div style={{
                      height: 2, flex: 0.3, background: pet.xp >= PET_STAGES[i + 1].hpRequired
                        ? "var(--green)" : "var(--border)", borderRadius: 1
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>
            📋 Study Tasks <span className="badge badge-orange" style={{ fontSize: 11 }}>+25 XP each</span>
          </h3>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              className="input"
              placeholder="Add a study task..."
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddTask()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleAddTask}>
              <Icon name="plus" size={14} />
            </button>
          </div>

          {tasks.length === 0 && (
            <p style={{ color: "var(--muted)", textAlign: "center", fontSize: 13, padding: "16px 0" }}>
              No tasks yet. Add some study tasks to earn XP!
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map(task => (
              <div key={task.id} className="card" style={{
                padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
                background: task.done ? "rgba(34,197,94,0.08)" : "var(--surface2)",
                border: `1px solid ${task.done ? "rgba(34,197,94,0.2)" : "var(--border)"}`,
                opacity: task.done ? 0.6 : 1
              }}>
                <button
                  style={{
                    width: 24, height: 24, borderRadius: "50%", border: "none",
                    background: task.done ? "var(--green)" : "var(--surface)",
                    cursor: task.done ? "default" : "pointer",
                    fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, color: task.done ? "#0f0e17" : "var(--muted)",
                    transition: "all 0.2s"
                  }}
                  onClick={() => !task.done && handleComplete(task)}
                >
                  {task.done ? "✓" : "○"}
                </button>
                <span style={{
                  fontSize: 14, flex: 1,
                  textDecoration: task.done ? "line-through" : "none",
                  color: task.done ? "var(--muted)" : "var(--text)"
                }}>{task.text}</span>
                {task.done && <span className="badge badge-green" style={{ fontSize: 10 }}>+25 XP</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PODCAST SCREEN ────────────────────────────────────────────────────────────
const PodcastScreen = ({ apiKeys, onXP }) => {
  const [notes, setNotes] = useState("");
  const [style, setStyle] = useState("engaging");
  const [script, setScript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const STYLES = [
    { id: "engaging", label: "🎙️ Engaging", desc: "Energetic host style" },
    { id: "academic", label: "🎓 Academic", desc: "Formal lecture tone" },
    { id: "storytelling", label: "📖 Story", desc: "Narrative format" },
    { id: "interview", label: "🎤 Interview", desc: "Q&A dialogue format" },
  ];

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setNotes(e.target.result);
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const generateScript = async () => {
    if (!notes.trim()) return;
    setError("");
    setIsGeneratingScript(true);
    setScript("");
    setAudioUrl("");
    try {
      const styleGuides = {
        engaging: "an energetic, engaging podcast host who makes learning fun with enthusiasm and relatable examples",
        academic: "a formal academic lecturer presenting material clearly and methodically",
        storytelling: "a storyteller who weaves the information into a compelling narrative",
        interview: "a podcast format alternating between host questions (labeled HOST:) and expert answers (labeled EXPERT:)",
      };
      const result = await callGemini(apiKeys.gemini,
        `Transform these student notes into a podcast script. Write as ${styleGuides[style]}.
        
The podcast should be 3-5 minutes when read aloud (about 450-700 words). Include:
- A catchy intro that hooks the listener
- Clear explanation of all key concepts from the notes
- Memorable examples or analogies
- A summary conclusion

Notes:
${notes}

Write ONLY the spoken script. No stage directions, no speaker labels (unless interview style). Start immediately with the script.`
      );
      setScript(result);
      onXP(30, "Podcast script generated! +30 XP");
    } catch (e) {
      setError(e.message);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateAudio = async () => {
    if (!script) return;
    setError("");
    setIsGeneratingAudio(true);
    try {
      // ElevenLabs has character limits, truncate if too long
      const truncated = script.length > 5000 ? script.slice(0, 5000) + "..." : script;
      const url = await callElevenLabs(apiKeys.elevenlabs, truncated, apiKeys.voiceId);
      setAudioUrl(url);
      onXP(50, "Podcast audio ready! +50 XP");
    } catch (e) {
      setError(e.message);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h2 className="screen-title">🎙️ Podcast</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>Turn notes into audio</p>
        </div>
        <span className="badge badge-orange">ElevenLabs</span>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Upload Zone */}
        <div
          className={`drop-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            style={{ display: "none" }}
            onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
          />
          <div style={{ fontSize: 32 }}>📄</div>
          <p style={{ fontWeight: 700, marginTop: 8 }}>Drop notes file here</p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>.txt or .md files • or type below</p>
        </div>

        {/* Notes textarea */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            Your Notes
          </label>
          <textarea
            className="textarea"
            style={{ marginTop: 8 }}
            placeholder="Paste or type your study notes here..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <div style={{ textAlign: "right", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            {notes.length} chars
          </div>
        </div>

        {/* Style selector */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
            Podcast Style
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                style={{
                  background: style === s.id ? "rgba(255,137,6,0.15)" : "var(--surface2)",
                  border: `1px solid ${style === s.id ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 12, padding: "10px 12px", cursor: "pointer",
                  textAlign: "left", transition: "all 0.2s", color: "var(--text)"
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, fontFamily: "Nunito" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Script */}
        <button
          className="btn btn-primary btn-full"
          onClick={generateScript}
          disabled={!notes.trim() || isGeneratingScript}
        >
          {isGeneratingScript ? (
            <><div className="loading-spinner" /> Generating script...</>
          ) : (
            <><Icon name="brain" /> Generate Podcast Script</>
          )}
        </button>

        {/* Script display */}
        {script && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800 }}>📜 Script Ready</h3>
              <span className="badge badge-green">✓ Generated</span>
            </div>
            <div style={{
              background: "var(--surface2)", borderRadius: 12, padding: 16,
              maxHeight: 200, overflowY: "auto", fontSize: 13, lineHeight: 1.7,
              color: "var(--muted)"
            }}>
              {script}
            </div>

            <button
              className="btn btn-full"
              style={{ marginTop: 12, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white" }}
              onClick={generateAudio}
              disabled={isGeneratingAudio}
            >
              {isGeneratingAudio ? (
                <><div className="loading-spinner" /> Creating audio...</>
              ) : (
                <><Icon name="mic" /> Convert to Audio (ElevenLabs)</>
              )}
            </button>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="card" style={{
            background: "linear-gradient(135deg, #1a1829, #1e1b3a)",
            border: "1px solid rgba(124,58,237,0.3)"
          }}>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={togglePlay}
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "var(--accent)", border: "none", cursor: "pointer",
                  fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "transform 0.15s"
                }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Your Study Podcast</div>
                {isPlaying ? (
                  <div className="sound-wave">
                    {[1,2,3,4,5].map(i => <div key={i} className="sound-bar" />)}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Ready to play</div>
                )}
              </div>
              <a
                href={audioUrl}
                download="study-podcast.mp3"
                style={{
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  borderRadius: 8, padding: "6px 12px", color: "var(--muted)",
                  fontSize: 12, fontWeight: 700, textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 4
                }}
              >
                ⬇ Save
              </a>
            </div>
          </div>
        )}

        {error && (
          <div className="card" style={{ background: "rgba(242,95,76,0.1)", border: "1px solid rgba(242,95,76,0.3)" }}>
            <p style={{ color: "var(--accent2)", fontSize: 13 }}>❌ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── QUIZ SCREEN ───────────────────────────────────────────────────────────────
const QuizScreen = ({ apiKeys, onXP }) => {
  const [notes, setNotes] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQ, setNumQ] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameState, setGameState] = useState("setup"); // setup | playing | finished
  const [answerState, setAnswerState] = useState(null); // correct | wrong | null
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);

  const generateQuiz = async () => {
    if (!notes.trim()) return;
    setError("");
    setIsGenerating(true);
    try {
      const raw = await callGemini(apiKeys.gemini,
        `Generate ${numQ} multiple-choice quiz questions based on these notes.
Difficulty: ${difficulty}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct": 0,
      "explanation": "Brief explanation why this is correct"
    }
  ]
}

Notes:
${notes}`,
        true
      );
      const parsed = JSON.parse(raw);
      setQuestions(parsed.questions);
      setCurrentQ(0);
      setScore(0);
      setStreak(0);
      setLives(3);
      setSelectedAnswer(null);
      setAnswerState(null);
      setGameState("playing");
    } catch (e) {
      setError("Failed to generate quiz: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (idx) => {
    if (answerState) return;
    setSelectedAnswer(idx);
    const isCorrect = idx === questions[currentQ].correct;
    setAnswerState(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const xpGained = 10 + (newStreak > 2 ? 5 : 0);
      setScore(s => s + xpGained);
      onXP(xpGained, `Correct! +${xpGained} XP${newStreak > 2 ? " 🔥 Streak!" : ""}`);
    } else {
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
    }
  };

  const nextQuestion = () => {
    if (lives <= 0 || currentQ >= questions.length - 1) {
      setGameState("finished");
      return;
    }
    setCurrentQ(q => q + 1);
    setSelectedAnswer(null);
    setAnswerState(null);
  };

  const resetQuiz = () => {
    setGameState("setup");
    setQuestions([]);
    setNotes("");
  };

  const q = questions[currentQ];
  const progressPct = questions.length > 0 ? ((currentQ + (answerState ? 1 : 0)) / questions.length) * 100 : 0;

  if (gameState === "finished") {
    const pct = Math.round((score / (questions.length * 10)) * 100);
    const grade = pct >= 90 ? "S" : pct >= 75 ? "A" : pct >= 60 ? "B" : pct >= 45 ? "C" : "D";
    const gradeColors = { S: "#facc15", A: "#22c55e", B: "#3da9fc", C: "#ff8906", D: "#f25f4c" };

    return (
      <div className="screen">
        <div style={{ padding: "60px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 72, animation: "pulse 1.5s ease infinite" }}>
              {pct >= 75 ? "🏆" : pct >= 50 ? "⭐" : "💪"}
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginTop: 12 }}>Quiz Complete!</h2>
            <div style={{
              fontSize: 80, fontWeight: 900, marginTop: 12,
              color: gradeColors[grade], fontFamily: "'Space Mono', monospace",
              textShadow: `0 0 40px ${gradeColors[grade]}66`
            }}>{grade}</div>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>{pct}% accuracy</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24 }}>
              <div className="card" style={{ background: "var(--surface2)" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent)" }}>{score}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>XP Earned</div>
              </div>
              <div className="card" style={{ background: "var(--surface2)" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent4)" }}>{lives}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Lives Left</div>
              </div>
            </div>

            <button className="btn btn-primary btn-full" style={{ marginTop: 20 }} onClick={resetQuiz}>
              🔄 New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "playing" && q) {
    return (
      <div className="screen">
        {/* HUD */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "rgba(15,14,23,0.95)", backdropFilter: "blur(10px)",
          padding: "16px 20px 12px", borderBottom: "1px solid var(--border)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3].map(i => (
                <span key={i} style={{ fontSize: 18, opacity: i <= lives ? 1 : 0.25 }}>❤️</span>
              ))}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "var(--accent)" }}>
              {currentQ + 1} / {questions.length}
            </div>
            {streak > 1 && (
              <div className="badge badge-orange">
                <Icon name="fire" size={11} /> {streak}x
              </div>
            )}
          </div>
          <div style={{ background: "var(--surface2)", height: 4, borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "linear-gradient(90deg, var(--accent4), var(--accent))",
              width: `${progressPct}%`, borderRadius: 2, transition: "width 0.3s"
            }} />
          </div>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Question */}
          <div className="card" style={{
            background: "linear-gradient(135deg, var(--surface), #1e1b3a)",
            border: "1px solid rgba(61,169,252,0.2)"
          }}>
            <div className="badge badge-blue" style={{ marginBottom: 12 }}>Question {currentQ + 1}</div>
            <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5 }}>{q.question}</p>
          </div>

          {/* Options */}
          {q.options.map((opt, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = i === q.correct;
            let bg = "var(--surface2)";
            let border = "var(--border)";
            let textColor = "var(--text)";
            let anim = "none";

            if (answerState) {
              if (isCorrect) { bg = "rgba(34,197,94,0.15)"; border = "rgba(34,197,94,0.5)"; textColor = "#86efac"; }
              else if (isSelected && !isCorrect) { bg = "rgba(242,95,76,0.15)"; border = "rgba(242,95,76,0.5)"; textColor = "#fca5a5"; }
              if (isSelected && isCorrect) anim = "correctBounce 0.5s ease";
              if (isSelected && !isCorrect) anim = "wrongShake 0.4s ease";
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={!!answerState}
                style={{
                  background: bg, border: `1px solid ${border}`,
                  borderRadius: 14, padding: "14px 16px", cursor: answerState ? "default" : "pointer",
                  textAlign: "left", transition: "all 0.15s", color: textColor,
                  fontFamily: "Nunito, sans-serif", fontSize: 14, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 12,
                  animation: isSelected ? anim : "none"
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: "50%", background: "var(--surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontFamily: "'Space Mono', monospace", flexShrink: 0,
                  color: "var(--muted)"
                }}>
                  {["A","B","C","D"][i]}
                </span>
                {opt.replace(/^[A-D]\)\s*/, "")}
              </button>
            );
          })}

          {/* Explanation + Next */}
          {answerState && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <div className="card" style={{
                background: answerState === "correct" ? "rgba(34,197,94,0.1)" : "rgba(242,95,76,0.1)",
                border: `1px solid ${answerState === "correct" ? "rgba(34,197,94,0.3)" : "rgba(242,95,76,0.3)"}`
              }}>
                <div style={{ fontWeight: 800, marginBottom: 4, color: answerState === "correct" ? "var(--green)" : "var(--accent2)" }}>
                  {answerState === "correct" ? "✅ Correct!" : "❌ Incorrect"}
                  {answerState === "correct" && streak > 2 && <span style={{ marginLeft: 8 }}>🔥 Streak!</span>}
                </div>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{q.explanation}</p>
              </div>
              <button
                className="btn btn-primary btn-full"
                style={{ marginTop: 8 }}
                onClick={nextQuestion}
              >
                {currentQ >= questions.length - 1 || lives <= 1 ? "See Results →" : "Next Question →"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h2 className="screen-title">🎯 Quiz Game</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>Test your knowledge</p>
        </div>
        <span className="badge badge-purple">Gemini AI</span>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            Study Notes
          </label>
          <textarea
            className="textarea"
            style={{ marginTop: 8 }}
            placeholder="Paste your notes to generate questions from..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Settings */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>⚙️ Quiz Settings</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>Difficulty</label>
              <div className="tabs" style={{ marginTop: 8 }}>
                {["easy", "medium", "hard", "exam"].map(d => (
                  <button
                    key={d}
                    className={`tab ${difficulty === d ? "active" : ""}`}
                    onClick={() => setDifficulty(d)}
                    style={{ textTransform: "capitalize" }}
                  >
                    {d === "easy" ? "😊" : d === "medium" ? "😐" : d === "hard" ? "😰" : "💀"} {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>
                Number of Questions: <strong style={{ color: "var(--accent)" }}>{numQ}</strong>
              </label>
              <input
                type="range" min={3} max={15} value={numQ}
                onChange={e => setNumQ(Number(e.target.value))}
                style={{ width: "100%", marginTop: 8, accentColor: "var(--accent)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                <span>3</span><span>15</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lives info */}
        <div className="card" style={{ background: "rgba(242,95,76,0.08)", border: "1px solid rgba(242,95,76,0.2)", flexDirection: "row", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 28 }}>❤️❤️❤️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>3 Lives System</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Lose a life for each wrong answer. Maintain streaks for bonus XP!</div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-full"
          style={{ fontSize: 16, padding: "16px" }}
          onClick={generateQuiz}
          disabled={!notes.trim() || isGenerating}
        >
          {isGenerating ? (
            <><div className="loading-spinner" /> Generating Questions...</>
          ) : (
            <><Icon name="quiz" /> Start Quiz ({numQ} questions)</>
          )}
        </button>

        {error && (
          <div className="card" style={{ background: "rgba(242,95,76,0.1)", border: "1px solid rgba(242,95,76,0.3)" }}>
            <p style={{ color: "var(--accent2)", fontSize: 13 }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── HOME SCREEN ───────────────────────────────────────────────────────────────
const HomeScreen = ({ pet, setTab, stats }) => {
  const stage = getPetStage(pet.xp);

  const features = [
    {
      icon: "🎙️", title: "Podcast", desc: "Convert notes to audio",
      tab: "podcast", color: "#ff8906", badge: "ElevenLabs"
    },
    {
      icon: "🎯", title: "Quiz Game", desc: "Test your knowledge",
      tab: "quiz", color: "#3da9fc", badge: "Gemini AI"
    },
    {
      icon: "🐾", title: "Your Pet", desc: `${stage.name} • ${pet.xp} XP`,
      tab: "pet", color: "#a78bfa", badge: "Level Up"
    },
  ];

  return (
    <div className="screen">
      <div style={{
        padding: "56px 20px 20px",
        background: "linear-gradient(180deg, rgba(124,58,237,0.12) 0%, transparent 100%)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>
              {new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 900, marginTop: 2, letterSpacing: -0.5 }}>
              Study<span style={{ color: "var(--accent)" }}>Pet</span> 🐉
            </h1>
          </div>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "10px 14px", textAlign: "center"
          }}>
            <div style={{ fontSize: 24, animation: "float 3s ease-in-out infinite" }}>{stage.emoji}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", marginTop: 4 }}>{pet.xp} XP</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { v: pet.xp, l: "XP", c: "var(--accent)" },
            { v: stats.quizzesDone, l: "Quizzes", c: "var(--accent4)" },
            { v: stats.podcastsDone, l: "Podcasts", c: "#a78bfa" },
            { v: stats.tasksCompleted, l: "Tasks", c: "var(--green)" },
          ].map(s => (
            <div key={s.l} className="card" style={{ padding: "10px 0", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.c, fontFamily: "'Space Mono', monospace" }}>{s.v}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <h2 style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>Features</h2>
        {features.map(f => (
          <button
            key={f.tab}
            onClick={() => setTab(f.tab)}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "18px 18px", cursor: "pointer",
              textAlign: "left", width: "100%", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 16,
              fontFamily: "Nunito, sans-serif"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = f.color;
              e.currentTarget.style.background = `${f.color}0d`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--surface)";
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `${f.color}18`, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 26, flexShrink: 0
            }}>{f.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: "var(--text)" }}>{f.title}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px",
                  borderRadius: 99, background: `${f.color}22`, color: f.color
                }}>{f.badge}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>{f.desc}</p>
            </div>
            <span style={{ color: "var(--muted)", fontSize: 18 }}>›</span>
          </button>
        ))}

        {/* Quick tip */}
        <div className="card" style={{
          background: "linear-gradient(135deg, rgba(255,137,6,0.1), rgba(242,95,76,0.1))",
          border: "1px solid rgba(255,137,6,0.2)"
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>💡</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Pro Tip</div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                Complete study tasks to earn XP for your pet! Your pet evolves as you study more. 🐉
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function StudyPetApp() {
  const [apiKeys, setApiKeys] = useState(null);
  const [tab, setTab] = useState("home");
  const [xpToast, setXpToast] = useState(null);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Read Chapter 1 notes", done: false },
    { id: 2, text: "Review flashcards for 15 min", done: false },
  ]);
  const [pet, setPet] = useState({
    name: "Ember",
    xp: 0,
    streak: 0,
    quizzesDone: 0,
    podcastsDone: 0,
  });
  const [stats, setStats] = useState({
    quizzesDone: 0,
    podcastsDone: 0,
    tasksCompleted: 0,
  });

  const showXpToast = (msg) => {
    setXpToast(msg);
    setTimeout(() => setXpToast(null), 2000);
  };

  const gainXP = useCallback((amount, msg) => {
    setPet(p => ({ ...p, xp: p.xp + amount }));
    if (msg) showXpToast(msg);
  }, []);

  const handlePodcastXP = useCallback((amount, msg) => {
    gainXP(amount, msg);
    if (msg?.includes("audio")) {
      setPet(p => ({ ...p, podcastsDone: p.podcastsDone + 1 }));
      setStats(s => ({ ...s, podcastsDone: s.podcastsDone + 1 }));
    }
  }, [gainXP]);

  const handleQuizXP = useCallback((amount, msg) => {
    gainXP(amount, msg);
  }, [gainXP]);

  const addTask = (text) => {
    setTasks(t => [...t, { id: Date.now(), text, done: false }]);
  };

  const completeTask = (id) => {
    setTasks(t => t.map(task => task.id === id ? { ...task, done: true } : task));
    setPet(p => ({ ...p, streak: p.streak + 1 }));
    setStats(s => ({ ...s, tasksCompleted: s.tasksCompleted + 1 }));
  };

  const NAV = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "podcast", icon: "🎙️", label: "Podcast" },
    { id: "quiz", icon: "🎯", label: "Quiz" },
    { id: "pet", icon: "🐾", label: "Pet" },
  ];

  if (!apiKeys) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="app-root">
          <OnboardingScreen onComplete={setApiKeys} />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className="app-root">
        {xpToast && <div className="xp-toast">⚡ {xpToast}</div>}

        <div style={{ overflowY: "auto", height: "100vh" }}>
          {tab === "home" && <HomeScreen pet={pet} setTab={setTab} stats={stats} />}
          {tab === "podcast" && <PodcastScreen apiKeys={apiKeys} onXP={handlePodcastXP} />}
          {tab === "quiz" && <QuizScreen apiKeys={apiKeys} onXP={handleQuizXP} />}
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

        <nav className="bottom-nav">
          {NAV.map(n => (
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
