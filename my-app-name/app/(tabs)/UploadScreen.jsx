// ─── UploadScreen.jsx ────────────────────────────────────────────────────────
// Handles uploading / pasting notes. Calls onNotesReady(text) when done.
// Used as a shared entry point before going to Podcast or Quiz.

import { useState, useRef } from "react";

export default function UploadScreen({ onGoToPodcast, onGoToQuiz }) {
  const [notes, setNotes]       = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef            = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setNotes(e.target.result);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clearNotes = () => { setNotes(""); setFileName(""); };

  return (
    <div className="screen">
      {/* ── Header ── */}
      <div className="screen-header">
        <div>
          <h2 className="screen-title">📄 Upload Notes</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>
            Load your notes, then choose what to do
          </p>
        </div>
        <span className="badge badge-blue">Step 1</span>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Drop Zone ── */}
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
            accept=".txt,.md,.pdf"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div style={{ fontSize: 40 }}>{fileName ? "✅" : "📂"}</div>
          <p style={{ fontWeight: 800, marginTop: 10, fontSize: 15 }}>
            {fileName ? fileName : "Drop a file here"}
          </p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            {fileName ? "Click to replace" : ".txt or .md accepted · or type below"}
          </p>
        </div>

        {/* ── Divider ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>OR TYPE / PASTE</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* ── Textarea ── */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
              Your Notes
            </label>
            {notes && (
              <button
                onClick={clearNotes}
                style={{ background: "none", border: "none", color: "var(--accent2)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                ✕ Clear
              </button>
            )}
          </div>
          <textarea
            className="textarea"
            placeholder="Paste or type your study notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ minHeight: 180 }}
          />
          <div style={{ textAlign: "right", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            {notes.length.toLocaleString()} characters
          </div>
        </div>

        {/* ── Preview card ── */}
        {notes.trim() && (
          <div className="card" style={{
            background: "rgba(34,197,94,0.07)",
            border: "1px solid rgba(34,197,94,0.2)",
            padding: "14px 16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>📝</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>Notes ready!</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  ~{Math.round(notes.split(/\s+/).filter(Boolean).length)} words
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            What do you want to do with these notes?
          </p>

          <button
            className="btn btn-full"
            style={{
              background: notes.trim()
                ? "linear-gradient(135deg, #ff8906, #f25f4c)"
                : "var(--surface2)",
              color: notes.trim() ? "#0f0e17" : "var(--muted)",
              fontSize: 15, padding: "16px",
              border: notes.trim() ? "none" : "1px solid var(--border)",
            }}
            disabled={!notes.trim()}
            onClick={() => onGoToPodcast(notes)}
          >
            🎙️ Create Podcast from Notes
          </button>

          <button
            className="btn btn-full"
            style={{
              background: notes.trim()
                ? "linear-gradient(135deg, #3da9fc, #7c3aed)"
                : "var(--surface2)",
              color: notes.trim() ? "#fffffe" : "var(--muted)",
              fontSize: 15, padding: "16px",
              border: notes.trim() ? "none" : "1px solid var(--border)",
            }}
            disabled={!notes.trim()}
            onClick={() => onGoToQuiz(notes)}
          >
            🎯 Start Quiz from Notes
          </button>
        </div>

        {/* ── Tips ── */}
        <div className="card" style={{
          background: "rgba(61,169,252,0.07)",
          border: "1px solid rgba(61,169,252,0.2)"
        }}>
          <p style={{ fontSize: 12, color: "var(--accent4)", lineHeight: 1.7, fontWeight: 600 }}>
            <strong>💡 Tips for best results:</strong><br />
            • Include headers and bullet points in your notes<br />
            • Longer notes = richer podcast &amp; more quiz questions<br />
            • Plain text (.txt) and Markdown (.md) work best
          </p>
        </div>
      </div>
    </div>
  );
}
