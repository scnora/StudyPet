// ─── PodcastScreen.jsx ───────────────────────────────────────────────────────
// Receives notes (string) as a prop, generates a podcast script via Gemini,
// then converts it to audio via ElevenLabs.

import { useState, useRef } from "react";
import { callGemini, callElevenLabs } from "./shared.js";

const STYLES = [
  { id: "engaging",     label: "🎙️ Engaging",   desc: "Energetic host style" },
  { id: "academic",     label: "🎓 Academic",    desc: "Formal lecture tone" },
  { id: "storytelling", label: "📖 Story",       desc: "Narrative format" },
  { id: "interview",    label: "🎤 Interview",   desc: "Q&A dialogue format" },
];

const STYLE_GUIDES = {
  engaging:     "an energetic, engaging podcast host who makes learning fun with enthusiasm and relatable examples",
  academic:     "a formal academic lecturer presenting material clearly and methodically",
  storytelling: "a storyteller who weaves the information into a compelling narrative",
  interview:    "a podcast format alternating between host questions (labeled HOST:) and expert answers (labeled EXPERT:)",
};

export default function PodcastScreen({ notes, apiKeys, onXP, onBack }) {
  const [style,              setStyle]              = useState("engaging");
  const [script,             setScript]             = useState("");
  const [audioUrl,           setAudioUrl]           = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio,  setIsGeneratingAudio]  = useState(false);
  const [isPlaying,          setIsPlaying]          = useState(false);
  const [progress,           setProgress]           = useState(0);
  const [error,              setError]              = useState("");
  const audioRef  = useRef(null);
  const timerRef  = useRef(null);

  // ── Generate script ──────────────────────────────────────────────────────
  const generateScript = async () => {
    setError(""); setIsGeneratingScript(true); setScript(""); setAudioUrl("");
    try {
      const result = await callGemini(
        apiKeys.gemini,
        `Transform these student notes into a podcast script. Write as ${STYLE_GUIDES[style]}.

The podcast should be 3–5 minutes when read aloud (~500–700 words). Include:
- A catchy intro that hooks the listener
- Clear explanation of all key concepts from the notes  
- Memorable examples or analogies
- A punchy summary conclusion

Notes:
${notes}

Write ONLY the spoken script. No stage directions, no [brackets]. Start immediately with the spoken words.`
      );
      setScript(result);
      onXP(30, "Script generated! +30 XP");
    } catch (e) {
      setError(e.message);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // ── Generate audio ───────────────────────────────────────────────────────
  const generateAudio = async () => {
    setError(""); setIsGeneratingAudio(true);
    try {
      const url = await callElevenLabs(apiKeys.elevenlabs, script, apiKeys.voiceId);
      setAudioUrl(url);
      onXP(50, "Podcast ready! +50 XP");
    } catch (e) {
      setError(e.message);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // ── Audio controls ───────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    setProgress(duration ? (currentTime / duration) * 100 : 0);
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  return (
    <div className="screen">
      {/* ── Header ── */}
      <div className="screen-header">
        <div>
          <button onClick={onBack} style={{
            background: "none", border: "none", color: "var(--muted)",
            fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 4,
            display: "flex", alignItems: "center", gap: 4
          }}>← Back to notes</button>
          <h2 className="screen-title">🎙️ Podcast</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>Notes → Audio</p>
        </div>
        <span className="badge badge-orange">ElevenLabs</span>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Notes summary ── */}
        <div className="card" style={{
          padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
          background: "rgba(255,137,6,0.07)", border: "1px solid rgba(255,137,6,0.2)"
        }}>
          <span style={{ fontSize: 22 }}>📝</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13 }}>Notes loaded</div>
            <div style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {notes.slice(0, 80)}{notes.length > 80 ? "…" : ""}
            </div>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, flexShrink: 0 }}>
            {notes.split(/\s+/).filter(Boolean).length}w
          </span>
        </div>

        {/* ── Style selector ── */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
            Podcast Style
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                style={{
                  background: style === s.id ? "rgba(255,137,6,0.15)" : "var(--surface2)",
                  border: `1px solid ${style === s.id ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 12, padding: "10px 12px", cursor: "pointer",
                  textAlign: "left", transition: "all 0.2s", color: "var(--text)",
                  fontFamily: "Nunito, sans-serif",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Generate script button ── */}
        <button
          className="btn btn-primary btn-full"
          onClick={generateScript}
          disabled={isGeneratingScript}
          style={{ fontSize: 15, padding: "15px" }}
        >
          {isGeneratingScript
            ? <><div className="loading-spinner" /> Writing script with Gemini...</>
            : <>🧠 Generate Podcast Script</>}
        </button>

        {/* ── Script display ── */}
        {script && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800 }}>📜 Script</h3>
              <span className="badge badge-green">✓ Ready</span>
            </div>
            <div style={{
              background: "var(--surface2)", borderRadius: 12, padding: 16,
              maxHeight: 220, overflowY: "auto", fontSize: 13, lineHeight: 1.8,
              color: "var(--muted)"
            }}>
              {script}
            </div>

            {/* Re-generate or go to audio */}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={generateScript}
                disabled={isGeneratingScript}
                style={{ flexShrink: 0 }}
              >
                🔄 Redo
              </button>
              <button
                className="btn btn-full"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white" }}
                onClick={generateAudio}
                disabled={isGeneratingAudio}
              >
                {isGeneratingAudio
                  ? <><div className="loading-spinner" /> Synthesizing voice...</>
                  : <>🎤 Convert to Audio</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Audio player ── */}
        {audioUrl && (
          <div className="card" style={{
            background: "linear-gradient(135deg, #1a1829, #1e1b3a)",
            border: "1px solid rgba(124,58,237,0.35)"
          }}>
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => { setIsPlaying(false); setProgress(100); }}
            />

            {/* Waveform / progress bar */}
            <div
              onClick={handleSeek}
              style={{
                height: 6, background: "var(--surface2)", borderRadius: 99,
                marginBottom: 14, cursor: "pointer", overflow: "hidden"
              }}
            >
              <div style={{
                height: "100%", width: `${progress}%`, borderRadius: 99,
                background: "linear-gradient(90deg, #7c3aed, var(--accent))",
                transition: "width 0.3s"
              }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={togglePlay}
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "var(--accent)", border: "none", cursor: "pointer",
                  fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "transform 0.15s"
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Your Study Podcast</div>
                {isPlaying
                  ? <div className="sound-wave">{[1,2,3,4,5].map((i) => <div key={i} className="sound-bar" />)}</div>
                  : <div style={{ fontSize: 12, color: "var(--muted)" }}>Tap ▶ to listen</div>}
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

        {/* ── Error ── */}
        {error && (
          <div className="card" style={{ background: "rgba(242,95,76,0.1)", border: "1px solid rgba(242,95,76,0.3)" }}>
            <p style={{ color: "var(--accent2)", fontSize: 13 }}>❌ {error}</p>
            <button
              onClick={() => setError("")}
              style={{ marginTop: 8, background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
